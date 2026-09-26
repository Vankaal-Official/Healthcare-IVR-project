import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReminderChannel, ReminderStatus } from '@prisma/client';

export interface PlannedReminder {
  channel: ReminderChannel;
  scheduledFor: Date;
  leadMinutes: number;
  status: ReminderStatus;
  reason?: string;
}

export interface ReminderPlan {
  isLateBooking: boolean;
  isPastAppointment: boolean;
  sms?: PlannedReminder;
  voice?: PlannedReminder;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly defaultSmsLead: number;
  private readonly defaultVoiceLead: number;
  private readonly minimumVoiceLead: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('reminders') private readonly reminderQueue: Queue,
  ) {
    this.defaultSmsLead = this.configService.get<number>('reminders.defaultSmsLeadMinutes', 30);
    this.defaultVoiceLead = this.configService.get<number>('reminders.defaultVoiceLeadMinutes', 60);
    this.minimumVoiceLead = this.configService.get<number>('reminders.minimumVoiceLeadMinutes', 5);
  }

  /**
   * Calculates reminder execution timings based on lead time and late booking rules (Voice: 1 hr / 60m, SMS: 30m)
   */
  calculateSchedule(appointmentUtc: Date, now: Date = new Date()): ReminderPlan {
    const diffMs = appointmentUtc.getTime() - now.getTime();
    const remainingMinutes = Math.floor(diffMs / (60 * 1000));

    if (remainingMinutes <= 0) {
      // Past appointment - do not send reminders
      return {
        isLateBooking: false,
        isPastAppointment: true,
      };
    }

    const plan: ReminderPlan = {
      isLateBooking: remainingMinutes < this.defaultVoiceLead,
      isPastAppointment: false,
    };

    // 1. Calculate Voice / IVR reminder (T-60)
    if (remainingMinutes > this.defaultVoiceLead) {
      // Standard T-60
      const scheduledFor = new Date(appointmentUtc.getTime() - this.defaultVoiceLead * 60 * 1000);
      plan.voice = {
        channel: ReminderChannel.VOICE,
        scheduledFor,
        leadMinutes: this.defaultVoiceLead,
        status: ReminderStatus.SCHEDULED,
      };
    } else if (remainingMinutes >= this.minimumVoiceLead) {
      // 5 to 60 mins: Send Voice immediately
      plan.voice = {
        channel: ReminderChannel.VOICE,
        scheduledFor: now,
        leadMinutes: remainingMinutes,
        status: ReminderStatus.SCHEDULED,
        reason: 'Late booking - immediate IVR call',
      };
    } else {
      // Less than minimum voice lead time (e.g. < 5 min): Skip voice reminder
      plan.voice = {
        channel: ReminderChannel.VOICE,
        scheduledFor: now,
        leadMinutes: remainingMinutes,
        status: ReminderStatus.SKIPPED,
        reason: `Insufficient lead time (< ${this.minimumVoiceLead} mins) for voice call`,
      };
    }

    // 2. Calculate SMS reminder (T-30)
    if (remainingMinutes > this.defaultSmsLead) {
      // Standard T-30
      const scheduledFor = new Date(appointmentUtc.getTime() - this.defaultSmsLead * 60 * 1000);
      plan.sms = {
        channel: ReminderChannel.SMS,
        scheduledFor,
        leadMinutes: this.defaultSmsLead,
        status: ReminderStatus.SCHEDULED,
      };
    } else {
      // Late booking (< 30 min): Send SMS immediately
      plan.sms = {
        channel: ReminderChannel.SMS,
        scheduledFor: now,
        leadMinutes: remainingMinutes,
        status: ReminderStatus.SCHEDULED,
        reason: 'Late booking - immediate SMS',
      };
    }

    return plan;
  }

  /**
   * Persists reminder records in PostgreSQL and enqueues delayed jobs into BullMQ
   */
  async createRemindersForAppointment(
    tenantId: string,
    appointmentId: string,
    appointmentUtc: Date,
    now: Date = new Date(),
  ) {
    const plan = this.calculateSchedule(appointmentUtc, now);
    const created = [];

    // 1. Persist and enqueue Voice reminder (T-60)
    if (plan.voice) {
      const voiceReminder = await this.prisma.reminder.create({
        data: {
          tenantId,
          appointmentId,
          channel: ReminderChannel.VOICE,
          scheduledFor: plan.voice.scheduledFor,
          leadMinutes: plan.voice.leadMinutes,
          status: plan.voice.status,
          failureReason: plan.voice.reason,
        },
      });
      created.push(voiceReminder);

      if (voiceReminder.status === ReminderStatus.SCHEDULED) {
        await this.enqueueDelayedJob(voiceReminder.id, appointmentId, tenantId, ReminderChannel.VOICE, voiceReminder.scheduledFor, now);
      }
    }

    // 2. Persist and enqueue SMS reminder (T-30)
    if (plan.sms && plan.sms.status !== ReminderStatus.SKIPPED) {
      const smsReminder = await this.prisma.reminder.create({
        data: {
          tenantId,
          appointmentId,
          channel: ReminderChannel.SMS,
          scheduledFor: plan.sms.scheduledFor,
          leadMinutes: plan.sms.leadMinutes,
          status: plan.sms.status,
          failureReason: plan.sms.reason,
        },
      });
      created.push(smsReminder);

      if (smsReminder.status === ReminderStatus.SCHEDULED) {
        await this.enqueueDelayedJob(smsReminder.id, appointmentId, tenantId, ReminderChannel.SMS, smsReminder.scheduledFor, now);
      }
    }

    return { plan, reminders: created };
  }

  /**
   * Schedules a delayed job in BullMQ with deterministic ID for instant removal
   */
  private async enqueueDelayedJob(
    reminderId: string,
    appointmentId: string,
    tenantId: string,
    channel: ReminderChannel,
    scheduledFor: Date,
    now: Date,
  ) {
    const delayMs = Math.max(0, scheduledFor.getTime() - now.getTime());
    const jobId = `reminder_${reminderId}`;

    await this.reminderQueue.add(
      'send_reminder',
      {
        reminderId,
        appointmentId,
        tenantId,
        channel,
      },
      {
        jobId,
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`[BullMQ Queue] Enqueued ${channel} job "${jobId}" with delay ${delayMs}ms`);
  }

  /**
   * Cancels pending reminders in PostgreSQL AND removes them from the BullMQ Redis queue
   */
  async cancelPendingReminders(tenantId: string, appointmentId: string, reason: string = 'Appointment cancelled') {
    // 1. Find all pending reminders for this appointment
    const pendingReminders = await this.prisma.reminder.findMany({
      where: {
        tenantId,
        appointmentId,
        status: ReminderStatus.SCHEDULED,
      },
    });

    // 2. Remove each from BullMQ queue
    for (const reminder of pendingReminders) {
      const jobId = `reminder_${reminder.id}`;
      try {
        await this.reminderQueue.remove(jobId);
        this.logger.log(`[BullMQ Queue] Removed pending job "${jobId}" from Redis queue`);
      } catch (err: any) {
        this.logger.warn(`Could not remove job "${jobId}" from queue: ${err.message}`);
      }
    }

    // 3. Mark as CANCELLED in PostgreSQL
    return this.prisma.reminder.updateMany({
      where: {
        tenantId,
        appointmentId,
        status: ReminderStatus.SCHEDULED,
      },
      data: {
        status: ReminderStatus.CANCELLED,
        failureReason: reason,
      },
    });
  }

  /**
   * Recalculates reminders for a rescheduled appointment:
   * Removes old pending jobs from Redis and enqueues new delayed jobs
   */
  async rescheduleReminders(
    tenantId: string,
    appointmentId: string,
    newAppointmentUtc: Date,
    now: Date = new Date(),
  ) {
    // 1. Cancel previous pending reminders from both PostgreSQL and BullMQ
    await this.cancelPendingReminders(tenantId, appointmentId, 'Appointment rescheduled');

    // 2. Schedule new reminders with recalculated delays
    return this.createRemindersForAppointment(tenantId, appointmentId, newAppointmentUtc, now);
  }

  /**
   * Gets reminders for an appointment
   */
  async getAppointmentReminders(tenantId: string, appointmentId: string) {
    return this.prisma.reminder.findMany({
      where: { tenantId, appointmentId },
      orderBy: { scheduledFor: 'asc' },
    });
  }
}
