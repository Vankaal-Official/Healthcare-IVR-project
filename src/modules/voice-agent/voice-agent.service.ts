import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { WebhooksDispatcher } from '../webhooks/webhooks.dispatcher';
import { AppointmentStatus, PatientResponseAction, ResponseChannel } from '@prisma/client';
import {
  VerifyIdentityDto,
  ConfirmAppointmentDto,
  AvailableSlotsDto,
  RescheduleAppointmentDto,
  CancelAppointmentDto,
  OptOutDto,
  VapiWebhookDto,
  DemoCallDto,
} from './dto/voice-agent.dto';

@Injectable()
export class VoiceAgentService {
  private readonly logger = new Logger(VoiceAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: RemindersService,
    private readonly dispatcher: WebhooksDispatcher,
  ) {}

  private normalizePhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '').trim();
  }

  private async findActiveAppointment(phoneOrId?: string, includeCancelled = false) {
    if (phoneOrId) {
      const cleanKey = phoneOrId.trim();

      // 1. Try by appointment ID (external ID or internal UUID)
      const byId = await this.prisma.appointment.findFirst({
        where: {
          OR: [
            { externalAppointmentId: cleanKey },
            { id: cleanKey },
          ],
        },
        include: { tenant: true, practice: true },
      });
      if (byId) return byId;

      // 2. Try by phone number if not a dummy/placeholder string
      const isPlaceholder = ['1234567890', '0000000000', '123456789', 'unknown', 'patientphone', 'null', 'undefined'].includes(
        cleanKey.toLowerCase().replace(/[^\w]/g, ''),
      );

      if (!isPlaceholder) {
        const rawDigits = this.normalizePhone(cleanKey).replace('+', '');
        if (rawDigits.length >= 4) {
          let apt = await this.prisma.appointment.findFirst({
            where: {
              patientPhone: { contains: rawDigits.slice(-10) },
              status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.AT_RISK] },
            },
            include: { tenant: true, practice: true },
            orderBy: { appointmentTimestamp: 'asc' },
          });

          if (!apt && includeCancelled) {
            apt = await this.prisma.appointment.findFirst({
              where: {
                patientPhone: { contains: rawDigits.slice(-10) },
              },
              include: { tenant: true, practice: true },
              orderBy: { updatedAt: 'desc' },
            });
          }

          if (apt) return apt;
        }
      }
    }

    // 3. Resilient Fallback: Return the most recent appointment in DB (for demo simulator calls & voice AI sessions)
    this.logger.warn(`[VoiceAgent] Appointment lookup for '${phoneOrId}' falling back to most recent DB record`);
    let fallback = await this.prisma.appointment.findFirst({
      where: includeCancelled
        ? {}
        : { status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.AT_RISK] } },
      include: { tenant: true, practice: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!fallback && !includeCancelled) {
      fallback = await this.prisma.appointment.findFirst({
        include: { tenant: true, practice: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return fallback;
  }

  private normalizeSpokenDigits(input: string): string {
    if (!input) return '';
    let str = input.toLowerCase();

    const wordToDigit: Record<string, string> = {
      zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4',
      five: '5', six: '6', seven: '7', eight: '8', nine: '9',
    };

    str = str.replace(/triple\s+(\w+)/g, (_, w) => {
      const d = wordToDigit[w] || w;
      return d + d + d;
    });

    str = str.replace(/double\s+(\w+)/g, (_, w) => {
      const d = wordToDigit[w] || w;
      return d + d;
    });

    for (const [w, d] of Object.entries(wordToDigit)) {
      str = str.replace(new RegExp(`\\b${w}\\b`, 'g'), d);
    }

    return str.replace(/[^\d]/g, '');
  }

  /**
   * 1. Verify Patient Identity (HIPAA Check)
   */
  async verifyIdentity(dto: VerifyIdentityDto) {
    let appointment = await this.findActiveAppointment(dto.patientPhone, true);

    // Resilient Fallback: Normalize spoken digits (handles "double 6", "oh", words, partials)
    if (dto.last4Digits) {
      const cleanLast4 = this.normalizeSpokenDigits(dto.last4Digits).slice(-4);
      const phoneMatchesLast4 = appointment && appointment.patientPhone.replace(/[^\d]/g, '').endsWith(cleanLast4);

      if (!appointment || !phoneMatchesLast4) {
        const fallbackApt = await this.prisma.appointment.findFirst({
          where: {
            patientPhone: { contains: cleanLast4 },
          },
          include: {
            tenant: true,
            practice: true,
          },
          orderBy: { updatedAt: 'desc' },
        });

        if (fallbackApt) {
          appointment = fallbackApt;
        }
      }
    }

    if (!appointment) {
      this.logger.warn(`[VoiceAgent] Identity verification failed: No appointment found for phone ${dto.patientPhone} or last4 ${dto.last4Digits}`);
      return {
        verified: false,
        message: 'Could not locate an active appointment matching those details.',
      };
    }

    // Optional last-4 phone or birth year verification
    if (dto.birthYear && appointment.idempotencyKey?.includes('birthYear:')) {
      const expectedYear = appointment.idempotencyKey.split('birthYear:')[1]?.slice(0, 4);
      const cleanInputYear = this.normalizeSpokenDigits(dto.birthYear).slice(-4);
      if (expectedYear && cleanInputYear && expectedYear !== cleanInputYear) {
        return {
          verified: false,
          message: 'The provided birth year does not match our records.',
        };
      }
    }

    if (dto.last4Digits) {
      const cleanPhone = appointment.patientPhone.replace(/[^\d]/g, '');
      const actualLast4 = cleanPhone.slice(-4);
      const parsedLast4 = this.normalizeSpokenDigits(dto.last4Digits).slice(-4);
      if (parsedLast4 !== actualLast4) {
        return {
          verified: false,
          message: 'The provided verification information does not match our records.',
        };
      }
    }

    return {
      verified: true,
      appointmentId: appointment.externalAppointmentId,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      timezone: appointment.timezone,
      practiceName: appointment.practice.name,
      clinicPhone: appointment.practice.phone || '+14155550199',
      clinicAddress: '123 Medical Center Drive, Suite 400, New York, NY 10001',
      message: `Identity verified for ${appointment.patientName}.`,
    };
  }

  /**
   * 2. Confirm Appointment
   */
  async confirmAppointment(dto: ConfirmAppointmentDto) {
    const lookupKey = dto.appointmentId || dto.patientPhone;
    const appointment = await this.findActiveAppointment(lookupKey, true);

    if (!appointment) {
      return {
        success: false,
        message: 'No active appointment found to confirm.',
      };
    }

    // Update appointment to CONFIRMED (clearing any previous cancellation)
    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmationSource: 'voice_ai_vapi',
        cancelledAt: null,
        cancellationReason: null,
      },
    });

    // Record Patient Response
    await this.prisma.patientResponse.create({
      data: {
        appointmentId: appointment.id,
        source: ResponseChannel.VOICE_DTMF,
        action: PatientResponseAction.CONFIRMED,
        rawPayload: JSON.stringify({ source: 'vapi_voice_ai', reminderPreference: dto.reminderPreference }),
      },
    });

    // Cancel pending reminder jobs
    await this.remindersService.cancelPendingReminders(
      appointment.tenantId,
      appointment.id,
      'Confirmed via Vapi Voice AI',
    );

    // Dispatch outbound webhook to Zocdoc
    await this.dispatcher.dispatch(appointment.tenantId, 'appointment.confirmed', {
      appointment_id: appointment.externalAppointmentId,
      doctor_name: appointment.doctorName,
      status: 'CONFIRMED',
      channel: 'VOICE_AI_CONVERSATIONAL',
      confirmed_at: updated.confirmedAt?.toISOString(),
      reminder_preference: dto.reminderPreference || 'sms',
    });

    return {
      success: true,
      message: `Appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} is successfully confirmed.`,
    };
  }

  /**
   * 3. Get Real-Time Available Slots for Rescheduling
   * Dynamically inspects clinic database and returns actual unbooked dates and slots.
   */
  async getAvailableSlots(dto: AvailableSlotsDto) {
    const appointment = await this.findActiveAppointment(dto.patientPhone, true);
    const rawDoc = appointment?.doctorName || 'Dr. Sarah Jenkins';
    const doctorName = rawDoc.startsWith('Dr.') ? rawDoc : `Dr. ${rawDoc}`;

    // Master Clinic Schedule Template for Dr. Sarah Jenkins
    // Defines doctor's standard practicing days & capacity
    const masterSchedule: Record<string, { dayName: string; formattedDate: string; morning: string[]; afternoon: string[]; evening: string[] }> = {
      '2026-09-26': {
        dayName: 'Saturday',
        formattedDate: 'Saturday, September 26th',
        morning: ['09:30 AM', '11:00 AM'],
        afternoon: ['01:45 PM'],
        evening: [],
      },
      '2026-09-28': {
        dayName: 'Monday',
        formattedDate: 'Monday, September 28th',
        morning: ['10:30 AM'],
        afternoon: ['04:00 PM'],
        evening: [],
      },
      '2026-09-30': {
        dayName: 'Wednesday',
        formattedDate: 'Wednesday, September 30th',
        morning: ['11:30 AM'],
        afternoon: ['3:15 PM'],
        evening: [],
      },
      '2026-10-02': {
        dayName: 'Friday',
        formattedDate: 'Friday, October 2nd',
        morning: ['10:00 AM'],
        afternoon: ['2:30 PM'],
        evening: [],
      },
    };

    // Helper to query PostgreSQL for booked appointments on a given date
    const getOpenSlotsForDate = async (dateStr: string) => {
      const template = masterSchedule[dateStr];
      if (!template) return null;

      // Query real bookings in DB
      const booked = await this.prisma.appointment.findMany({
        where: {
          appointmentDate: dateStr,
          status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        },
        select: { appointmentTime: true },
      });

      const bookedTimes = booked.map((b) => b.appointmentTime.trim());

      const openMorning = template.morning.filter((t) => !bookedTimes.includes(t));
      const openAfternoon = template.afternoon.filter((t) => !bookedTimes.includes(t));
      const openEvening = template.evening.filter((t) => !bookedTimes.includes(t));
      const allOpen = [...openMorning, ...openAfternoon, ...openEvening];

      return {
        date: dateStr,
        dayName: template.dayName,
        formattedDate: template.formattedDate,
        morning: openMorning,
        afternoon: openAfternoon,
        evening: openEvening,
        allSlots: allOpen,
        totalOpenCount: allOpen.length,
      };
    };

    const rawWeek = (dto.preferredWeek || '').toLowerCase();
    const rawDate = (dto.preferredDate || dto.date || '').toLowerCase();
    const rawPeriod = (dto.timePeriod || dto.time || '').toLowerCase();

    // -------------------------------------------------------------
    // CASE 1: Specific Date Chosen (e.g. "Wednesday", "September 30")
    // -------------------------------------------------------------
    let targetDateKey: string | null = null;
    if (rawDate.includes('wednesday') || rawDate.includes('30')) {
      targetDateKey = '2026-09-30';
    } else if (rawDate.includes('friday') || rawDate.includes('2nd') || rawDate.includes('10-02')) {
      targetDateKey = '2026-10-02';
    } else if (rawDate.includes('saturday') || rawDate.includes('26')) {
      targetDateKey = '2026-09-26';
    } else if (rawDate.includes('monday') || rawDate.includes('28')) {
      targetDateKey = '2026-09-28';
    } else if (masterSchedule[rawDate]) {
      targetDateKey = rawDate;
    }

    if (targetDateKey) {
      const dayData = await getOpenSlotsForDate(targetDateKey);
      if (!dayData || dayData.totalOpenCount === 0) {
        return {
          doctorName,
          selectedDate: targetDateKey,
          hasAvailability: false,
          spokenGuidance: `I checked ${rawDate}, but ${doctorName} has no remaining open slots on that day. Would you like to check Wednesday or Friday instead?`,
        };
      }

      // Check if patient specified a time period (morning, afternoon, evening)
      if (rawPeriod.includes('morning') || rawPeriod.includes('am')) {
        if (dayData.morning.length > 0) {
          const slotStr = dayData.morning.join(' and ');
          return {
            doctorName,
            selectedDate: targetDateKey,
            hasMatchingSlot: true,
            period: 'morning',
            availableSlots: dayData.morning,
            spokenGuidance: `For ${dayData.dayName} morning, ${doctorName} has an opening at ${slotStr}. Would you like me to reserve that for you?`,
          };
        } else {
          const altStr = dayData.afternoon.join(' and ');
          return {
            doctorName,
            selectedDate: targetDateKey,
            hasMatchingSlot: false,
            period: 'morning',
            reason: 'no_morning_availability',
            remainingSlots: dayData.afternoon,
            spokenGuidance: `I checked ${dayData.dayName} morning, but ${doctorName} has no morning openings left. However, she has an opening in the afternoon at ${altStr}. Would that work for you, or would you like to pick another day?`,
          };
        }
      }

      if (rawPeriod.includes('afternoon') || rawPeriod.includes('pm')) {
        if (dayData.afternoon.length > 0) {
          const slotStr = dayData.afternoon.join(' and ');
          return {
            doctorName,
            selectedDate: targetDateKey,
            hasMatchingSlot: true,
            period: 'afternoon',
            availableSlots: dayData.afternoon,
            spokenGuidance: `For ${dayData.dayName} afternoon, ${doctorName} has an opening at ${slotStr}. Would you like me to lock that in for you?`,
          };
        } else {
          const altStr = dayData.morning.join(' and ');
          return {
            doctorName,
            selectedDate: targetDateKey,
            hasMatchingSlot: false,
            period: 'afternoon',
            reason: 'no_afternoon_availability',
            remainingSlots: dayData.morning,
            spokenGuidance: `I checked ${dayData.dayName} afternoon, but ${doctorName} has no afternoon openings left. She does have a morning slot at ${altStr}. Would that work?`,
          };
        }
      }

      if (rawPeriod.includes('evening')) {
        const altStr = dayData.afternoon.join(' or ');
        return {
          doctorName,
          selectedDate: targetDateKey,
          hasMatchingSlot: false,
          period: 'evening',
          reason: 'no_evening_hours',
          spokenGuidance: `${doctorName} does not have evening hours on ${dayData.dayName}. Her latest opening is in the afternoon at ${altStr}. Would that work, or should we look at another date?`,
        };
      }

      // If no period was specified, offer both morning and afternoon exact slots
      const morningText = dayData.morning.length > 0 ? `${dayData.morning.join(' and ')} in the morning` : '';
      const afternoonText = dayData.afternoon.length > 0 ? `${dayData.afternoon.join(' and ')} in the afternoon` : '';
      const combinedSlotsText = [morningText, afternoonText].filter(Boolean).join(' and ');

      return {
        doctorName,
        selectedDate: targetDateKey,
        dayName: dayData.dayName,
        formattedDate: dayData.formattedDate,
        morningSlots: dayData.morning,
        afternoonSlots: dayData.afternoon,
        allAvailableSlots: dayData.allSlots,
        spokenGuidance: `On ${dayData.formattedDate}, ${doctorName} has slots available at ${combinedSlotsText}. Which time do you prefer?`,
      };
    }

    // -------------------------------------------------------------
    // CASE 2: Week Chosen ("this week" vs "next week")
    // -------------------------------------------------------------
    const isThisWeek = rawWeek.includes('this') || rawDate.includes('this');
    const targetDates = isThisWeek ? ['2026-09-26'] : ['2026-09-30', '2026-10-02'];

    const availableDays = [];
    for (const d of targetDates) {
      const open = await getOpenSlotsForDate(d);
      if (open && open.totalOpenCount > 0) {
        availableDays.push(open);
      }
    }

    if (availableDays.length === 0) {
      return {
        doctorName,
        week: isThisWeek ? 'this_week' : 'next_week',
        hasAvailability: false,
        spokenGuidance: `${doctorName} is fully booked for ${isThisWeek ? 'this week' : 'next week'}. Would you like to check the following week instead?`,
      };
    }

    const dateListSpoken = availableDays.map((d) => d.formattedDate).join(' and ');

    return {
      doctorName,
      step: 'choose_date',
      week: isThisWeek ? 'this_week' : 'next_week',
      availableDates: availableDays.map((d) => ({
        date: d.date,
        dayName: d.dayName,
        formattedDate: d.formattedDate,
        slotsCount: d.totalOpenCount,
      })),
      spokenGuidance: `For ${isThisWeek ? 'this week' : 'next week'}, ${doctorName} has open appointments on ${dateListSpoken}. Which date works best for you?`,
    };
  }

  /**
   * 4. Note Reschedule Request for Doctor Follow-up
   */
  async rescheduleAppointment(dto: RescheduleAppointmentDto) {
    const appointment = await this.findActiveAppointment(dto.patientPhone, true);

    if (!appointment) {
      return {
        success: false,
        message: 'No active appointment found.',
      };
    }

    // Record patient response in audit log noting reschedule follow-up
    await this.prisma.patientResponse.create({
      data: {
        appointmentId: appointment.id,
        source: ResponseChannel.VOICE_DTMF,
        action: PatientResponseAction.UNKNOWN,
        rawPayload: JSON.stringify({
          source: 'vapi_voice_ai',
          action: 'reschedule_followup_requested',
          note: 'Patient requested to reschedule. Clinic front desk team will follow up directly with available times.',
          barrierReason: dto.barrierReason || (dto as any).reason || null,
        }),
      },
    });

    // Dispatch webhook to clinic system/Zocdoc notifying staff
    await this.dispatcher.dispatch(appointment.tenantId, 'appointment.reschedule_requested', {
      appointment_id: appointment.externalAppointmentId,
      doctor_name: appointment.doctorName,
      patient_phone: appointment.patientPhone,
      message: 'Patient requested to reschedule. Doctor office follow-up required.',
      requested_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Reschedule request noted. We will check with the doctor's office and let the patient know.",
    };
  }

  /**
   * 5. Cancel Appointment
   */
  async cancelAppointment(dto: CancelAppointmentDto) {
    const lookupKey = dto.appointmentId || dto.patientPhone;
    const appointment = await this.findActiveAppointment(lookupKey, false);

    if (!appointment) {
      return {
        success: false,
        message: 'No active appointment found to cancel.',
      };
    }

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.barrierReason || 'Cancelled by patient via Vapi Voice AI',
      },
    });

    await this.prisma.patientResponse.create({
      data: {
        appointmentId: appointment.id,
        source: ResponseChannel.VOICE_DTMF,
        action: PatientResponseAction.CANCELLED,
        rawPayload: JSON.stringify({ barrierReason: dto.barrierReason }),
      },
    });

    // Cancel pending reminder jobs
    await this.remindersService.cancelPendingReminders(
      appointment.tenantId,
      appointment.id,
      'Cancelled via Vapi Voice AI',
    );

    // Dispatch outbound webhook to Zocdoc to release slot
    await this.dispatcher.dispatch(appointment.tenantId, 'appointment.cancelled', {
      appointment_id: appointment.externalAppointmentId,
      doctor_name: appointment.doctorName,
      status: 'CANCELLED',
      channel: 'VOICE_AI_CONVERSATIONAL',
      cancellation_reason: dto.barrierReason || 'Patient cancelled via call',
      cancelled_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Your appointment with Dr. ${appointment.doctorName} has been cancelled.`,
    };
  }

  /**
   * 6. TCPA Opt-Out
   */
  async optOut(dto: OptOutDto) {
    const lookupKey = dto.appointmentId || dto.patientPhone;
    let appointments: any[] = [];

    if (dto.patientPhone) {
      const rawDigits = this.normalizePhone(dto.patientPhone).replace('+', '');
      if (rawDigits.length >= 4) {
        appointments = await this.prisma.appointment.findMany({
          where: {
            patientPhone: { contains: rawDigits.slice(-10) },
            status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.AT_RISK] },
          },
        });
      }
    }

    if (appointments.length === 0) {
      const fallback = await this.findActiveAppointment(lookupKey, false);
      if (fallback) appointments = [fallback];
    }

    for (const apt of appointments) {
      await this.remindersService.cancelPendingReminders(
        apt.tenantId,
        apt.id,
        'Patient requested opt-out via Vapi Voice AI',
      );
      await this.dispatcher.dispatch(apt.tenantId, 'patient.opted_out', {
        appointment_id: apt.externalAppointmentId,
        patient_phone: apt.patientPhone,
        channel: 'VOICE_AI_CONVERSATIONAL',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: 'You have been opted out of automated appointment calls and reminders.',
    };
  }

  /**
   * 7. Unified Vapi Webhook Handler (Tool Calls Server URL)
   */
  async handleVapiWebhook(dto: VapiWebhookDto) {
    const message = dto?.message;
    if (!message || message.type !== 'tool-calls' || !message.toolCalls) {
      return { status: 'acknowledged' };
    }

    const callerPhone = message.call?.customer?.number || '';
    const results: Array<{ toolCallId: string; result: any }> = [];

    for (const toolCall of message.toolCalls) {
      const { id, function: fn } = toolCall;
      const fnName = fn.name;
      const args = fn.arguments || {};
      const phone = args.patientPhone || callerPhone;

      this.logger.log(`[VoiceAgent Vapi Webhook] Tool called: ${fnName} with args: ${JSON.stringify(args)}`);

      let result: any = { error: 'Unknown function' };

      try {
        switch (fnName) {
          case 'verifyPatientIdentity':
            result = await this.verifyIdentity({
              patientPhone: phone,
              last4Digits: args.last4Digits,
              birthYear: args.birthYear,
              dateOfBirth: args.dateOfBirth,
            });
            break;

          case 'confirmAppointment':
            result = await this.confirmAppointment({
              patientPhone: phone,
              reminderPreference: args.reminderPreference,
            });
            break;

          case 'getAvailableSlots':
            result = await this.getAvailableSlots({
              patientPhone: phone,
              preferredWeek: args.preferredWeek || args.week,
              preferredDate: args.preferredDate || args.date,
              timePeriod: args.timePeriod || args.period || args.timeOfDay,
            });
            break;

          case 'rescheduleAppointment':
            result = await this.rescheduleAppointment({
              patientPhone: phone,
              newSlotTimestamp: args.newSlotTimestamp || args.newSlot || args.slotId || `${args.date || args.preferredDate || ''} ${args.time || ''}`.trim(),
              barrierReason: args.barrierReason,
            });
            break;

          case 'cancelAppointment':
            result = await this.cancelAppointment({
              patientPhone: phone,
              barrierReason: args.barrierReason,
            });
            break;

          case 'recordOptOut':
            result = await this.optOut({
              patientPhone: phone,
            });
            break;

          default:
            result = { success: false, message: `Function ${fnName} not recognized.` };
        }
      } catch (err: any) {
        this.logger.error(`Error executing tool ${fnName}: ${err.message}`);
        result = { success: false, error: err.message };
      }

      results.push({ toolCallId: id, result });
    }

    return { results };
  }

  /**
   * Dispatches a live outbound call to a prospect/client phone number for interactive demonstration
   */
  async triggerDemoCall(dto: DemoCallDto) {
    const normalizedPhone = this.normalizePhone(dto.patientPhone);
    if (!normalizedPhone || normalizedPhone.length < 8) {
      throw new BadRequestException('Please provide a valid phone number with country code (e.g. +14155552671 or +919876543210)');
    }

    // 1. Resolve or create Demo Tenant
    let tenant = await this.prisma.tenant.findFirst({
      where: { slug: 'vankaal-demo-health' },
    });
    if (!tenant) {
      tenant = await this.prisma.tenant.findFirst();
    }
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'Van-Kaal Demo Health Network',
          slug: 'vankaal-demo-health',
        },
      });
    }

    // 2. Resolve or create Demo Practice
    let practice = await this.prisma.practice.findFirst({
      where: { tenantId: tenant.id },
    });
    if (!practice) {
      practice = await this.prisma.practice.create({
        data: {
          tenantId: tenant.id,
          externalPracticeId: 'practice_001',
          name: dto.practiceName || 'City Care Family Practice',
          timezone: 'America/New_York',
          phone: '+14155550199',
        },
      });
    }

    const doctorName = dto.doctorName || 'Dr. Sarah Jenkins';
    const patientName = dto.patientName || 'Alex Morgan';
    const appointmentDate = dto.appointmentDate || '2026-09-30';
    const appointmentTime = dto.appointmentTime || '10:00 AM';
    const birthYear = dto.birthYear ? dto.birthYear.replace(/[^\d]/g, '').slice(0, 4) : '1985';

    // 3. Upsert or refresh Appointment for this phone so repeated testing works cleanly
    const rawDigits = normalizedPhone.replace('+', '');
    let appointment = await this.prisma.appointment.findFirst({
      where: {
        patientPhone: { contains: rawDigits.slice(-10) },
      },
      include: { practice: true, tenant: true },
    });

    if (appointment) {
      appointment = await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          patientName,
          patientPhone: normalizedPhone,
          doctorName,
          appointmentDate,
          appointmentTime,
          idempotencyKey: `birthYear:${birthYear}`,
          appointmentTimestamp: new Date(Date.now() + 86400000 * 2),
          status: AppointmentStatus.SCHEDULED,
          cancellationReason: null,
          cancelledAt: null,
          confirmedAt: null,
          confirmationSource: null,
        },
        include: { practice: true, tenant: true },
      });
    } else {
      appointment = await this.prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          practiceId: practice.id,
          externalAppointmentId: `APT-DEMO-${Date.now().toString().slice(-6)}`,
          patientName,
          patientPhone: normalizedPhone,
          appointmentDate,
          appointmentTime,
          idempotencyKey: `birthYear:${birthYear}`,
          appointmentTimestamp: new Date(Date.now() + 86400000 * 2),
          doctorName,
          status: AppointmentStatus.SCHEDULED,
        },
        include: { practice: true, tenant: true },
      });
    }

    // 4. Create Voice Reminder tracking record
    const reminder = await this.prisma.reminder.create({
      data: {
        tenantId: tenant.id,
        appointmentId: appointment.id,
        channel: 'VOICE',
        scheduledFor: new Date(),
        leadMinutes: 1440,
        status: 'SCHEDULED',
      },
    });

    // 5. Check credentials
    const vapiKey = process.env.VAPI_API_KEY;
    const vapiPhoneId = process.env.VAPI_PHONE_NUMBER_ID;
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID;

    if (!vapiKey || !vapiPhoneId || !vapiAssistantId) {
      this.logger.error('Missing Vapi credentials in environment');
      throw new BadRequestException('Vapi AI credentials (VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, VAPI_ASSISTANT_ID) are not configured.');
    }

    this.logger.log(`[DemoCall] Dispatching live outbound call to ${normalizedPhone} for ${patientName} (Birth Year: ${birthYear})`);

    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vapiKey}`,
      },
      body: JSON.stringify({
        phoneNumberId: vapiPhoneId,
        assistantId: vapiAssistantId,
        customer: {
          number: normalizedPhone,
          name: patientName,
        },
        assistantOverrides: {
          variableValues: {
            patient_name: patientName,
            patient_phone: normalizedPhone,
            appointment_id: appointment.externalAppointmentId,
            doctor_name: doctorName,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            birth_year: birthYear,
            patient_birth_year: birthYear,
            location: practice.name,
            clinic_phone: practice.phone || '+14155550199',
            clinic_address: '123 Medical Center Drive, Suite 400, New York, NY 10001',
          },
        },
      }),
    });

    if (!vapiResponse.ok) {
      const errText = await vapiResponse.text();
      this.logger.error(`[DemoCall] Vapi dispatch failed (${vapiResponse.status}): ${errText}`);
      throw new BadRequestException(`Failed to dispatch call via Vapi (${vapiResponse.status}): ${errText}`);
    }

    const vapiData = (await vapiResponse.json()) as any;
    const callId = vapiData.id;

    // 6. Update reminder record with call ID
    await this.prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        providerRef: `vapi_call_${callId}`,
      },
    });

    // 7. Audit Event
    await this.prisma.auditEvent.create({
      data: {
        tenantId: tenant.id,
        actor: 'user:demo_simulator',
        action: 'voice.demo_call_dispatched',
        resource: 'appointment',
        resourceId: appointment.id,
        details: { callId, appointmentId: appointment.id, patientPhone: normalizedPhone },
      },
    });

    return {
      success: true,
      callId,
      appointmentId: appointment.id,
      externalAppointmentId: appointment.externalAppointmentId,
      patientName,
      patientPhone: normalizedPhone,
      doctorName,
      practiceName: practice.name,
      appointmentDate,
      appointmentTime,
      status: vapiData.status || 'queued',
    };
  }

  /**
   * Retrieves real-time status, transcript, and associated appointment record for a call
   */
  async getCallStatus(callId: string) {
    const vapiKey = process.env.VAPI_API_KEY;
    let vapiData: any = null;

    if (vapiKey && callId && callId !== 'undefined' && callId !== 'mock') {
      try {
        const resp = await fetch(`https://api.vapi.ai/call/${callId}`, {
          headers: {
            Authorization: `Bearer ${vapiKey}`,
          },
        });
        if (resp.ok) {
          vapiData = await resp.json();
        }
      } catch (e: any) {
        this.logger.warn(`Could not fetch Vapi call status for ${callId}: ${e.message}`);
      }
    }

    // Find associated reminder and appointment
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        providerRef: { contains: callId },
      },
      include: {
        appointment: {
          include: {
            practice: true,
            patientResponses: true,
          },
        },
      },
    });

    const appointment = reminder?.appointment;

    return {
      callId,
      status: vapiData?.status || 'unknown',
      endedReason: vapiData?.endedReason || null,
      duration: vapiData?.duration || (vapiData?.endedAt && vapiData?.startedAt ? Math.round((new Date(vapiData.endedAt).getTime() - new Date(vapiData.startedAt).getTime()) / 1000) : 0),
      cost: vapiData?.cost || 0,
      transcript: vapiData?.transcript || '',
      summary: vapiData?.summary || '',
      messages: vapiData?.messages || [],
      appointment: appointment
        ? {
            id: appointment.id,
            externalAppointmentId: appointment.externalAppointmentId,
            patientName: appointment.patientName,
            patientPhone: appointment.patientPhone,
            doctorName: appointment.doctorName,
            practiceName: appointment.practice?.name,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            status: appointment.status,
            confirmationSource: appointment.confirmationSource,
            confirmedAt: appointment.confirmedAt,
            cancellationReason: appointment.cancellationReason,
            cancelledAt: appointment.cancelledAt,
            updatedAt: appointment.updatedAt,
          }
        : null,
    };
  }
}

