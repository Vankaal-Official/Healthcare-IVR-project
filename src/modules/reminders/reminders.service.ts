import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  ) {
    this.defaultSmsLead = this.configService.get<number>('reminders.defaultSmsLeadMinutes', 60);
    this.defaultVoiceLead = this.configService.get<number>('reminders.defaultVoiceLeadMinutes', 30);
    this.minimumVoiceLead = this.configService.get<number>('reminders.minimumVoiceLeadMinutes', 5);
  }

  /**
   * Calculates reminder execution timings based on lead time and late booking rules (Section 6)
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
      isLateBooking: remainingMinutes < this.defaultSmsLead,
      isPastAppointment: false,
    };

    // 1. Calculate SMS reminder
    if (remainingMinutes > this.defaultSmsLead) {
      // Standard T-60
      const scheduledFor = new Date(appointmentUtc.getTime() - this.defaultSmsLead * 60 * 1000);
      plan.sms = {
        channel: ReminderChannel.SMS,
        scheduledFor,
        leadMinutes: this.defaultSmsLead,
        status: ReminderStatus.SCHEDULED,
      };
    } else {
      // Late booking: Send SMS immediately
      plan.sms = {
        channel: ReminderChannel.SMS,
        scheduledFor: now,
        leadMinutes: remainingMinutes,
        status: ReminderStatus.SCHEDULED,
        reason: 'Late booking - immediate SMS',
      };
    }

    // 2. Calculate Voice / IVR reminder
    if (remainingMinutes > this.defaultVoiceLead) {
      // Standard T-30
      const scheduledFor = new Date(appointmentUtc.getTime() - this.defaultVoiceLead * 60 * 1000);
      plan.voice = {
        channel: ReminderChannel.VOICE,
        scheduledFor,
        leadMinutes: this.defaultVoiceLead,
        status: ReminderStatus.SCHEDULED,
      };
    } else if (remainingMinutes >= this.minimumVoiceLead) {
      // 5 to 30 mins: Send Voice immediately
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

    return plan;
  }

  /**
   * Persists reminder records for an appointment in the database
   */
  async createRemindersForAppointment(
    tenantId: string,
    appointmentId: string,
    appointmentUtc: Date,
    now: Date = new Date(),
  ) {
    const plan = this.calculateSchedule(appointmentUtc, now);
    const created = [];

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
    }

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
    }

    return { plan, reminders: created };
  }

  /**
   * Cancels all pending reminders for an appointment (e.g. when cancelled or rescheduled)
   */
  async cancelPendingReminders(tenantId: string, appointmentId: string, reason: string = 'Appointment cancelled') {
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
   * Recalculates reminders for a rescheduled appointment
   */
  async rescheduleReminders(
    tenantId: string,
    appointmentId: string,
    newAppointmentUtc: Date,
    now: Date = new Date(),
  ) {
    // 1. Cancel previous pending reminders
    await this.cancelPendingReminders(tenantId, appointmentId, 'Appointment rescheduled');

    // 2. Schedule new reminders
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
