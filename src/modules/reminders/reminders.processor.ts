import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentStatus, ReminderChannel, ReminderStatus } from '@prisma/client';

export interface ReminderJobData {
  reminderId: string;
  appointmentId: string;
  tenantId: string;
  channel: ReminderChannel;
}

@Processor('reminders')
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ReminderJobData>): Promise<any> {
    const { reminderId, appointmentId, tenantId, channel } = job.data;
    this.logger.log(`[Worker] Picked up job ${job.id} for ${channel} reminder (ID: ${reminderId})`);

    // 1. Fetch current appointment and reminder status from PostgreSQL
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: { practice: true },
    });

    if (!appointment) {
      this.logger.warn(`[Worker] Appointment ${appointmentId} not found. Discarding job.`);
      return { status: 'discarded_not_found' };
    }

    // 2. Cancellation Race Condition Check (Section 7.1)
    // "Before sending, re-check appointment status so a just-cancelled appointment is not contacted."
    if (appointment.status === AppointmentStatus.CANCELLED) {
      this.logger.warn(
        `[Worker] Aborting reminder for Appointment ${appointment.externalAppointmentId}: Appointment has been CANCELLED.`,
      );
      await this.prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: ReminderStatus.CANCELLED,
          failureReason: 'Aborted: Appointment cancelled before execution',
        },
      });
      return { status: 'aborted_cancelled' };
    }

    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder || reminder.status === ReminderStatus.CANCELLED || reminder.status === ReminderStatus.SENT) {
      this.logger.log(`[Worker] Reminder ${reminderId} already in status ${reminder?.status}. Skipping.`);
      return { status: 'skipped' };
    }

    // 3. Mark reminder as SENDING
    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: { status: ReminderStatus.SENDING },
    });

    try {
      // 4. Communication Provider Execution (Abstraction point for Afsana's Twilio SDK)
      this.logger.log(
        `[Worker] Dispatching ${channel} to ${appointment.patientPhone} for Dr. ${appointment.doctorName} at ${appointment.practice.name}`,
      );

      // In production, Afsana's Twilio provider will return the Twilio Message / Call SID
      const providerRef = `mock_twilio_${channel.toLowerCase()}_${Date.now()}`;

      // 5. Update reminder record to SENT
      const updatedReminder = await this.prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: ReminderStatus.SENT,
          sentAt: new Date(),
          providerRef,
        },
      });

      // 6. Record Audit Event
      await this.prisma.auditEvent.create({
        data: {
          tenantId,
          actor: 'system:bullmq-worker',
          action: `reminder.${channel.toLowerCase()}.sent`,
          resource: 'reminder',
          resourceId: reminderId,
          details: {
            channel,
            appointmentId: appointment.externalAppointmentId,
            providerRef,
          },
        },
      });

      this.logger.log(`[Worker] Successfully sent ${channel} reminder (ID: ${reminderId})`);
      return { success: true, reminderId, providerRef, sentAt: updatedReminder.sentAt };
    } catch (error: any) {
      this.logger.error(`[Worker] Failed to dispatch ${channel} reminder: ${error.message}`);

      // Track retry in DB
      await this.prisma.reminder.update({
        where: { id: reminderId },
        data: {
          retryCount: { increment: 1 },
          failureReason: error.message,
          status: job.attemptsMade + 1 >= (job.opts.attempts || 3) ? ReminderStatus.FAILED : ReminderStatus.SCHEDULED,
        },
      });

      // Rethrow to let BullMQ handle exponential backoff retry
      throw error;
    }
  }
}
