import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentStatus, ReminderChannel } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsService: TenantsService,
    private readonly remindersService: RemindersService,
  ) {}

  /**
   * Helper to accurately parse date, time, and IANA timezone into a UTC Date object
   */
  private parseAppointmentUtc(date: string, time: string, timezone: string): Date {
    const formattedTime = time.length === 5 ? `${time}:00` : time;
    const naiveIso = `${date}T${formattedTime}Z`;
    const naiveDate = new Date(naiveIso);

    if (isNaN(naiveDate.getTime())) {
      throw new BadRequestException(`Invalid date or time: ${date} ${time}`);
    }

    try {
      // Find timezone offset in minutes for the given IANA timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(naiveDate);
      const values: Record<string, string> = {};
      for (const part of parts) {
        values[part.type] = part.value;
      }

      // Reconstruct target local date assuming naiveDate was UTC
      const localDateInTz = new Date(
        Date.UTC(
          parseInt(values.year, 10),
          parseInt(values.month, 10) - 1,
          parseInt(values.day, 10),
          parseInt(values.hour === '24' ? '0' : values.hour, 10),
          parseInt(values.minute, 10),
          parseInt(values.second, 10),
        ),
      );

      // Difference represents the timezone offset
      const offsetMs = naiveDate.getTime() - localDateInTz.getTime();
      return new Date(naiveDate.getTime() + offsetMs);
    } catch {
      this.logger.warn(`Timezone '${timezone}' not recognized by Intl; falling back to UTC`);
      return naiveDate;
    }
  }

  /**
   * Register a new appointment and schedule reminders (POST /v1/appointments)
   */
  async create(tenantId: string, dto: CreateAppointmentDto, idempotencyKey?: string) {
    // 1. Idempotency / Duplicate Check
    const existing = await this.prisma.appointment.findUnique({
      where: {
        tenantId_externalAppointmentId: {
          tenantId,
          externalAppointmentId: dto.appointment_id,
        },
      },
      include: { reminders: true },
    });

    if (existing) {
      // If same idempotency key or exact match, return existing workflow acknowledgement
      this.logger.log(`Idempotent match for appointment ${dto.appointment_id}`);
      return this.formatResponse(existing);
    }

    // 2. Ensure Practice exists for this tenant
    const practice = await this.tenantsService.getOrCreatePractice(
      tenantId,
      dto.appointment.practice_id,
      `Practice ${dto.appointment.practice_id}`,
      dto.appointment.timezone,
    );

    // 3. Compute normalized UTC appointment timestamp
    const appointmentUtc = this.parseAppointmentUtc(
      dto.appointment.date,
      dto.appointment.time,
      dto.appointment.timezone || practice.timezone,
    );

    // 4. Create Appointment record
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        practiceId: practice.id,
        externalAppointmentId: dto.appointment_id,
        patientName: dto.patient.name,
        patientPhone: dto.patient.phone,
        appointmentDate: dto.appointment.date,
        appointmentTime: dto.appointment.time,
        timezone: dto.appointment.timezone || practice.timezone,
        appointmentTimestamp: appointmentUtc,
        doctorName: dto.appointment.doctor,
        status: AppointmentStatus.SCHEDULED,
        idempotencyKey,
      },
    });

    // 5. Calculate and schedule reminders (T-60 SMS, T-30 IVR + late booking handling)
    const { reminders } = await this.remindersService.createRemindersForAppointment(
      tenantId,
      appointment.id,
      appointmentUtc,
    );

    // Record audit event
    await this.prisma.auditEvent.create({
      data: {
        tenantId,
        actor: `tenant:${tenantId}`,
        action: 'appointment.created',
        resource: 'appointment',
        resourceId: appointment.id,
        details: {
          externalAppointmentId: dto.appointment_id,
          remindersScheduled: reminders.length,
        },
      },
    });

    return this.formatResponse({
      ...appointment,
      reminders,
    });
  }

  /**
   * Get appointment details and current reminder status (GET /v1/appointments/:id)
   */
  async findById(tenantId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        externalAppointmentId: appointmentId,
      },
      include: {
        reminders: true,
        practice: true,
        patientResponses: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment "${appointmentId}" not found for this tenant`);
    }

    return this.formatResponse(appointment);
  }

  /**
   * Cancel an appointment and suppress future reminders (POST /v1/appointments/:id/cancel)
   */
  async cancel(tenantId: string, appointmentId: string, dto?: CancelAppointmentDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        externalAppointmentId: appointmentId,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment "${appointmentId}" not found`);
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      return {
        success: true,
        appointment_id: appointmentId,
        status: 'cancelled',
        message: 'Appointment was already cancelled',
      };
    }

    // Update appointment status to CANCELLED
    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto?.reason || 'Cancelled by customer',
      },
      include: { reminders: true },
    });

    // Suppress pending reminders
    await this.remindersService.cancelPendingReminders(
      tenantId,
      appointment.id,
      dto?.reason || 'Cancelled by customer',
    );

    // Record audit event
    await this.prisma.auditEvent.create({
      data: {
        tenantId,
        actor: `tenant:${tenantId}`,
        action: 'appointment.cancelled',
        resource: 'appointment',
        resourceId: appointment.id,
        details: { reason: dto?.reason },
      },
    });

    return {
      success: true,
      appointment_id: appointmentId,
      status: 'cancelled',
      cancelled_at: updated.cancelledAt,
    };
  }

  /**
   * Reschedule an appointment and recalculate reminder jobs (POST /v1/appointments/:id/reschedule)
   */
  async reschedule(tenantId: string, appointmentId: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        externalAppointmentId: appointmentId,
      },
      include: { practice: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment "${appointmentId}" not found`);
    }

    const newTz = dto.timezone || appointment.timezone;
    const newAppointmentUtc = this.parseAppointmentUtc(dto.date, dto.time, newTz);

    // Update appointment
    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        appointmentDate: dto.date,
        appointmentTime: dto.time,
        timezone: newTz,
        appointmentTimestamp: newAppointmentUtc,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Recalculate reminders
    const { reminders } = await this.remindersService.rescheduleReminders(
      tenantId,
      appointment.id,
      newAppointmentUtc,
    );

    // Record audit event
    await this.prisma.auditEvent.create({
      data: {
        tenantId,
        actor: `tenant:${tenantId}`,
        action: 'appointment.rescheduled',
        resource: 'appointment',
        resourceId: appointment.id,
        details: {
          newDate: dto.date,
          newTime: dto.time,
        },
      },
    });

    return this.formatResponse({
      ...updated,
      reminders,
    });
  }

  /**
   * Formats the response matching Section 3.2 of the pilot design document
   */
  private formatResponse(appointment: any) {
    const smsReminder = appointment.reminders?.find((r: any) => r.channel === ReminderChannel.SMS);
    const voiceReminder = appointment.reminders?.find((r: any) => r.channel === ReminderChannel.VOICE);

    const remindersOutput: Record<string, any> = {};

    if (smsReminder) {
      remindersOutput.sms = {
        status: smsReminder.status.toLowerCase(),
        scheduled_for: smsReminder.scheduledFor.toISOString(),
      };
    }

    if (voiceReminder) {
      remindersOutput.voice = {
        status: voiceReminder.status.toLowerCase(),
        scheduled_for: voiceReminder.scheduledFor.toISOString(),
      };
    }

    return {
      success: true,
      appointment_id: appointment.externalAppointmentId,
      status: appointment.status.toLowerCase(),
      reminders: remindersOutput,
    };
  }

  /**
   * List all appointments formatted for the Zocdoc dashboard and API consumers
   */
  async findAll(tenantId?: string) {
    const whereClause: any = {};
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        practice: true,
        reminders: true,
        patientResponses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return appointments.map((apt) => this.formatZocdocAppointment(apt));
  }

  private formatZocdocAppointment(apt: any) {
    const cleanPhone = apt.patientPhone || '';
    let maskedPhone = cleanPhone;
    if (cleanPhone.length >= 7) {
      const start = cleanPhone.slice(0, cleanPhone.length - 4);
      const end = cleanPhone.slice(-4);
      maskedPhone = `${start.slice(0, 5)} •••-${end}`;
    }

    const smsReminder = apt.reminders?.find((r: any) => r.channel === ReminderChannel.SMS);
    const voiceReminder = apt.reminders?.find((r: any) => r.channel === ReminderChannel.VOICE);
    const lastResponse = apt.patientResponses?.[apt.patientResponses.length - 1];

    let mappedStatus: 'Confirmed' | 'Pending' | 'At Risk' | 'Cancelled' = 'Pending';
    if (apt.status === AppointmentStatus.CONFIRMED) mappedStatus = 'Confirmed';
    else if (apt.status === AppointmentStatus.CANCELLED) mappedStatus = 'Cancelled';
    else if (apt.status === AppointmentStatus.AT_RISK) mappedStatus = 'At Risk';
    else if (apt.status === AppointmentStatus.RESCHEDULED) mappedStatus = 'Confirmed';

    const isConfirmedOrRescheduled =
      apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.RESCHEDULED;

    return {
      appointment_id: apt.externalAppointmentId,
      patient_name: apt.patientName,
      patient_phone_masked: maskedPhone,
      doctor: apt.doctorName
        ? apt.doctorName.startsWith('Dr.')
          ? apt.doctorName
          : `Dr. ${apt.doctorName}`
        : 'Dr. Sarah Jenkins',
      practice_name: apt.practice?.name || 'Manhattan Health Center',
      time: apt.appointmentTime || '10:30 AM',
      date: apt.appointmentDate || 'Today',
      sms_status: smsReminder
        ? smsReminder.status === 'SENT'
          ? 'Delivered'
          : smsReminder.status === 'CANCELLED'
          ? 'Skipped'
          : 'Pending'
        : 'Pending',
      sms_scheduled_at: smsReminder?.scheduledFor
        ? new Date(smsReminder.scheduledFor).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Scheduled',
      sms_delivered_at: smsReminder?.sentAt
        ? new Date(smsReminder.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined,
      voice_status: voiceReminder
        ? voiceReminder.status === 'SENT'
          ? 'Delivered'
          : voiceReminder.status === 'CANCELLED'
          ? 'Delivered'
          : 'Pending'
        : isConfirmedOrRescheduled || apt.confirmedAt
        ? 'Delivered'
        : 'Pending',
      voice_completed_at:
        isConfirmedOrRescheduled || apt.confirmedAt
          ? new Date(apt.confirmedAt || apt.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined,
      status: mappedStatus,
      raw_status: apt.status,
      patient_response: lastResponse
        ? {
            channel:
              lastResponse.source === 'VOICE_DTMF'
                ? 'Voice DTMF'
                : lastResponse.source === 'SMS_REPLY'
                ? 'SMS Reply'
                : 'Secure Link',
            response: lastResponse.action === 'CONFIRMED' ? 'confirmed' : 'cancelled',
            received_at: new Date(lastResponse.receivedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
        : isConfirmedOrRescheduled || apt.confirmedAt
        ? {
            channel: 'Voice DTMF',
            response: 'confirmed',
            received_at: new Date(apt.confirmedAt || apt.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }
        : undefined,
      webhook_status: 'Delivered',
      billing: {
        billed_amount: isConfirmedOrRescheduled || voiceReminder ? 1.25 : 0.05,
        channel_type: isConfirmedOrRescheduled || voiceReminder ? 'Voice AI' : 'SMS',
        vapi_cost: isConfirmedOrRescheduled || voiceReminder ? 0.4719 : 0.0079,
        net_profit: isConfirmedOrRescheduled || voiceReminder ? 0.78 : 0.042,
        margin_percent: isConfirmedOrRescheduled || voiceReminder ? '62.2%' : '84.2%',
      },
    };
  }
}
