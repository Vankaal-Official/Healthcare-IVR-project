import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { WebhooksDispatcher } from './webhooks.dispatcher';
import { TwilioSmsWebhookDto } from './dto/twilio-sms-webhook.dto';
import { TwilioVoiceWebhookDto } from './dto/twilio-voice-webhook.dto';
import { TwilioStatusWebhookDto } from './dto/twilio-status-webhook.dto';
import { AppointmentStatus, PatientResponseAction, ResponseChannel } from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: RemindersService,
    private readonly dispatcher: WebhooksDispatcher,
  ) {}

  /**
   * Normalize phone number to match format in database (e.g. strip whitespace, handle E.164)
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\s+/g, '').trim();
  }

  /**
   * Finds the latest active appointment for a given patient phone number
   */
  private async findActiveAppointmentForPhone(phone: string) {
    const normalized = this.normalizePhone(phone);
    return this.prisma.appointment.findFirst({
      where: {
        patientPhone: { contains: normalized.replace('+', '') },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.AT_RISK] },
      },
      include: {
        tenant: true,
        practice: true,
      },
      orderBy: { appointmentTimestamp: 'asc' },
    });
  }

  /**
   * CASE 1, 3, 5, 8: Handle Inbound SMS Reply from Patient
   */
  async handleInboundSms(dto: TwilioSmsWebhookDto): Promise<{ twiml: string; statusHandled: string }> {
    const rawBody = (dto.Body || '').trim();
    const upperBody = rawBody.toUpperCase();
    const phone = dto.From;

    this.logger.log(`[Twilio Inbound SMS] Received "${rawBody}" from ${phone}`);

    // --- CASE 8: TCPA Opt-Out ("STOP", "UNSUBSCRIBE") ---
    if (upperBody === 'STOP' || upperBody === 'UNSUBSCRIBE' || upperBody === 'CANCEL ALL') {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          patientPhone: { contains: this.normalizePhone(phone).replace('+', '') },
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.AT_RISK] },
        },
      });

      for (const apt of appointments) {
        await this.remindersService.cancelPendingReminders(apt.tenantId, apt.id, 'Patient opted out via TCPA STOP');
        await this.dispatcher.dispatch(apt.tenantId, 'patient.opted_out', {
          appointment_id: apt.externalAppointmentId,
          patient_phone: phone,
          action: 'OPT_OUT',
          timestamp: new Date().toISOString(),
        });
      }

      return {
        twiml: '<Response><Message>You have been unsubscribed from appointment reminders. Reply START to resubscribe.</Message></Response>',
        statusHandled: 'OPTED_OUT',
      };
    }

    // Find the active appointment for this patient
    const appointment = await this.findActiveAppointmentForPhone(phone);
    if (!appointment) {
      this.logger.warn(`No active appointment found for phone ${phone}`);
      return {
        twiml: '<Response><Message>Thank you for your message. We could not find an upcoming appointment for this number.</Message></Response>',
        statusHandled: 'NO_APPOINTMENT_FOUND',
      };
    }

    // --- CASE 1: Patient Confirmed ("1", "YES", "CONFIRM", "Y") ---
    if (upperBody === '1' || upperBody === 'YES' || upperBody === 'CONFIRM' || upperBody === 'Y') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmationSource: 'sms_reply',
        },
      });

      // Record patient response in database
      await this.prisma.patientResponse.create({
        data: {
          appointmentId: appointment.id,
          source: ResponseChannel.SMS_REPLY,
          action: PatientResponseAction.CONFIRMED,
          rawPayload: rawBody,
        },
      });

      // Automatically cancel upcoming Voice IVR calls to save call costs
      await this.remindersService.cancelPendingReminders(
        appointment.tenantId,
        appointment.id,
        'Appointment already confirmed via SMS',
      );

      // Dispatch real-time outbound webhook to Zocdoc
      await this.dispatcher.dispatch(appointment.tenantId, 'appointment.confirmed', {
        appointment_id: appointment.externalAppointmentId,
        doctor_name: appointment.doctorName,
        status: 'CONFIRMED',
        channel: 'SMS_REPLY',
        received_text: rawBody,
        confirmed_at: new Date().toISOString(),
      });

      return {
        twiml: `<Response><Message>Thank you! Your appointment with ${appointment.doctorName} is confirmed.</Message></Response>`,
        statusHandled: 'CONFIRMED',
      };
    }

    // --- CASE 3: Patient Cancelled ("2", "NO", "CANCEL", "N") ---
    if (upperBody === '2' || upperBody === 'NO' || upperBody === 'CANCEL' || upperBody === 'N') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled by patient via SMS reply',
        },
      });

      await this.prisma.patientResponse.create({
        data: {
          appointmentId: appointment.id,
          source: ResponseChannel.SMS_REPLY,
          action: PatientResponseAction.CANCELLED,
          rawPayload: rawBody,
        },
      });

      // Cancel all upcoming reminders from Redis
      await this.remindersService.cancelPendingReminders(
        appointment.tenantId,
        appointment.id,
        'Patient cancelled appointment via SMS',
      );

      // Dispatch real-time outbound webhook to Zocdoc so they can release the slot
      await this.dispatcher.dispatch(appointment.tenantId, 'appointment.cancelled', {
        appointment_id: appointment.externalAppointmentId,
        doctor_name: appointment.doctorName,
        status: 'CANCELLED',
        channel: 'SMS_REPLY',
        slot_released_early: true,
        cancelled_at: new Date().toISOString(),
      });

      return {
        twiml: `<Response><Message>Your appointment with ${appointment.doctorName} has been cancelled. Please contact your clinic to reschedule.</Message></Response>`,
        statusHandled: 'CANCELLED',
      };
    }

    // --- CASE 5: Unrecognized / Invalid Text (e.g. "Thanks", "Who is this?", emoji) ---
    await this.prisma.patientResponse.create({
      data: {
        appointmentId: appointment.id,
        source: ResponseChannel.SMS_REPLY,
        action: PatientResponseAction.UNKNOWN,
        rawPayload: rawBody,
      },
    });

    return {
      twiml: `<Response><Message>We didn't catch that. Please reply 1 to Confirm your appointment with ${appointment.doctorName} or 2 to Cancel.</Message></Response>`,
      statusHandled: 'UNKNOWN_REPLY_ASSISTED',
    };
  }

  /**
   * CASE 2, 7: Handle Inbound Voice IVR Webhook (DTMF Keypress & AMD Voicemail)
   */
  async handleInboundVoice(dto: TwilioVoiceWebhookDto): Promise<{ twiml: string; statusHandled: string }> {
    const digits = (dto.Digits || '').trim();
    const speech = (dto.SpeechResult || '').toLowerCase().trim();
    const answeredBy = (dto.AnsweredBy || '').toLowerCase();
    const phone = dto.From;

    this.logger.log(
      `[Twilio Inbound Voice] Digits: "${digits}", Speech: "${speech}", AnsweredBy: "${answeredBy}" from ${phone}`,
    );

    const appointment = await this.findActiveAppointmentForPhone(phone);
    if (!appointment) {
      return {
        twiml: '<Response><Say>Thank you for calling. No upcoming appointments were found.</Say></Response>',
        statusHandled: 'NO_APPOINTMENT_FOUND',
      };
    }

    // --- CASE 7: Voicemail / Answering Machine Detected (AMD) ---
    if (answeredBy.startsWith('machine')) {
      this.logger.log(`[Twilio Voice AMD] Voicemail detected for ${appointment.externalAppointmentId}`);
      await this.dispatcher.dispatch(appointment.tenantId, 'reminder.voicemail_left', {
        appointment_id: appointment.externalAppointmentId,
        doctor_name: appointment.doctorName,
        channel: 'VOICE_IVR',
        answered_by: answeredBy,
        timestamp: new Date().toISOString(),
      });

      return {
        twiml: `<Response><Say>Hello, this is a reminder from Zocdoc regarding your appointment with ${appointment.doctorName}. Please call your clinic to confirm. Goodbye.</Say></Response>`,
        statusHandled: 'VOICEMAIL_LEFT',
      };
    }

    const isConfirmed = digits === '1' || speech.includes('confirm') || speech.includes('yes');
    const isCancelled = digits === '2' || speech.includes('cancel') || speech.includes('no');

    // --- CASE 2: Patient Confirmed via DTMF (1) or Speech ("confirm" / "yes") ---
    if (isConfirmed) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmationSource: speech ? 'voice_speech' : 'voice_dtmf',
        },
      });

      await this.prisma.patientResponse.create({
        data: {
          appointmentId: appointment.id,
          source: ResponseChannel.VOICE_DTMF,
          action: PatientResponseAction.CONFIRMED,
          rawPayload: speech ? `Speech=${speech}` : `Digits=${digits}`,
        },
      });

      await this.dispatcher.dispatch(appointment.tenantId, 'appointment.confirmed', {
        appointment_id: appointment.externalAppointmentId,
        doctor_name: appointment.doctorName,
        status: 'CONFIRMED',
        channel: 'VOICE_DTMF',
        confirmed_at: new Date().toISOString(),
      });

      return {
        twiml: '<Response><Say>Thank you! Your appointment has been confirmed. Goodbye.</Say></Response>',
        statusHandled: 'CONFIRMED_VOICE',
      };
    }

    // --- CASE 3 (Voice): Patient Cancelled via DTMF (2) or Speech ("cancel" / "no") ---
    if (isCancelled) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: speech
            ? `Cancelled by patient via Speech ("${speech}")`
            : 'Cancelled by patient via IVR Voice Key 2',
        },
      });

      await this.prisma.patientResponse.create({
        data: {
          appointmentId: appointment.id,
          source: ResponseChannel.VOICE_DTMF,
          action: PatientResponseAction.CANCELLED,
          rawPayload: speech ? `Speech=${speech}` : `Digits=${digits}`,
        },
      });

      await this.remindersService.cancelPendingReminders(
        appointment.tenantId,
        appointment.id,
        'Patient cancelled appointment via Voice IVR',
      );

      await this.dispatcher.dispatch(appointment.tenantId, 'appointment.cancelled', {
        appointment_id: appointment.externalAppointmentId,
        doctor_name: appointment.doctorName,
        status: 'CANCELLED',
        channel: 'VOICE_DTMF',
        slot_released_early: true,
        cancelled_at: new Date().toISOString(),
      });

      return {
        twiml: '<Response><Say>Your appointment has been cancelled. Goodbye.</Say></Response>',
        statusHandled: 'CANCELLED_VOICE',
      };
    }

    // Default Interactive Hybrid IVR Prompt (Accepts BOTH Speech and Keypad DTMF)
    return {
      twiml: `<Response><Gather input="speech dtmf" numDigits="1" timeout="5"><Say>Hello, this is Zocdoc reminding you of your appointment with ${appointment.doctorName}. Say confirm or press 1 to confirm. Say cancel or press 2 to cancel.</Say></Gather><Say>We did not receive your input. Goodbye.</Say></Response>`,
      statusHandled: 'PROMPT_PLAYED',
    };
  }

  /**
   * CASE 6: Handle Carrier Delivery Status Callback (Landline Detection Error 21614)
   */
  async handleDeliveryStatus(dto: TwilioStatusWebhookDto): Promise<{ statusHandled: string }> {
    const { ErrorCode, To, MessageStatus, MessageSid } = dto;
    this.logger.log(`[Twilio Status Callback] Sid: ${MessageSid}, Status: ${MessageStatus}, ErrorCode: ${ErrorCode}`);

    // Twilio Error 21614: Cannot send SMS to landline
    if (ErrorCode === '21614' && To) {
      const appointment = await this.findActiveAppointmentForPhone(To);
      if (appointment) {
        this.logger.warn(`[Landline Detected] Phone ${To} is a landline. Fast-tracking Voice IVR call immediately.`);

        // Dispatch alert to Zocdoc
        await this.dispatcher.dispatch(appointment.tenantId, 'reminder.landline_escalated', {
          appointment_id: appointment.externalAppointmentId,
          patient_phone: To,
          reason: 'Landline detected - fast-tracked to Voice IVR call',
          timestamp: new Date().toISOString(),
        });

        return { statusHandled: 'LANDLINE_ESCALATED' };
      }
    }

    return { statusHandled: MessageStatus || 'ACK' };
  }

  /**
   * CASE 4: Null Case / Timeout (Flag unanswered appointments approaching slot as AT_RISK)
   */
  async flagUnansweredAppointments(tenantId?: string): Promise<{ atRiskCount: number }> {
    const now = new Date();
    // Look for appointments scheduled within the next 2 hours that are still SCHEDULED with no response
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: AppointmentStatus.SCHEDULED,
        appointmentTimestamp: {
          gte: now,
          lte: twoHoursFromNow,
        },
        patientResponses: { none: {} },
      },
      include: { tenant: true },
    });

    for (const apt of appointments) {
      await this.prisma.appointment.update({
        where: { id: apt.id },
        data: { status: AppointmentStatus.AT_RISK },
      });

      // Dispatch alert to Zocdoc so clinic staff can follow up manually
      await this.dispatcher.dispatch(apt.tenantId, 'appointment.at_risk', {
        appointment_id: apt.externalAppointmentId,
        doctor_name: apt.doctorName,
        status: 'AT_RISK',
        reason: 'No response received from patient via SMS or Voice',
        appointment_time: apt.appointmentTimestamp.toISOString(),
      });
    }

    this.logger.log(`[At-Risk Check] Flagged ${appointments.length} appointments as AT_RISK due to no response`);
    return { atRiskCount: appointments.length };
  }
}
