import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { WebhooksDispatcher } from './webhooks.dispatcher';
import { RemindersService } from '../reminders/reminders.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentStatus, PatientResponseAction, ResponseChannel } from '@prisma/client';

describe('WebhooksService (8 Lifecycle Cases)', () => {
  let service: WebhooksService;
  let prisma: any;
  let remindersService: any;
  let dispatcher: any;

  const mockTenant = { id: 'tenant-123', name: 'Zocdoc East' };
  const mockAppointment = {
    id: 'apt-001',
    tenantId: 'tenant-123',
    externalAppointmentId: 'APT-98214',
    doctorName: 'Dr. Sarah Jenkins',
    patientName: 'Eleanor Vance',
    patientPhone: '+14155552671',
    status: AppointmentStatus.SCHEDULED,
    appointmentTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
    tenant: mockTenant,
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findFirst: jest.fn().mockResolvedValue(mockAppointment),
        findMany: jest.fn().mockResolvedValue([mockAppointment]),
        update: jest.fn().mockResolvedValue({ ...mockAppointment, status: AppointmentStatus.CONFIRMED }),
      },
      patientResponse: {
        create: jest.fn().mockResolvedValue({ id: 'resp-001' }),
      },
    };

    remindersService = {
      cancelPendingReminders: jest.fn().mockResolvedValue({ count: 1 }),
    };

    dispatcher = {
      dispatch: jest.fn().mockResolvedValue({ id: 'wh-001', status: 'pending' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: RemindersService, useValue: remindersService },
        { provide: WebhooksDispatcher, useValue: dispatcher },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  // CASE 1: Confirmed via SMS
  it('Case 1: should handle patient confirming via SMS ("1")', async () => {
    const result = await service.handleInboundSms({
      From: '+14155552671',
      Body: '1',
    });

    expect(result.statusHandled).toBe('CONFIRMED');
    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AppointmentStatus.CONFIRMED,
          confirmationSource: 'sms_reply',
        }),
      }),
    );
    expect(prisma.patientResponse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: PatientResponseAction.CONFIRMED,
          source: ResponseChannel.SMS_REPLY,
        }),
      }),
    );
    // Verifies voice call is cancelled in BullMQ
    expect(remindersService.cancelPendingReminders).toHaveBeenCalledWith(
      'tenant-123',
      'apt-001',
      expect.stringContaining('SMS'),
    );
    // Verifies outbound webhook dispatched to Zocdoc
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'appointment.confirmed',
      expect.objectContaining({
        appointment_id: 'APT-98214',
        status: 'CONFIRMED',
      }),
    );
  });

  // CASE 2: Confirmed via Voice IVR
  it('Case 2: should handle patient confirming via Voice IVR DTMF ("1")', async () => {
    const result = await service.handleInboundVoice({
      From: '+14155552671',
      Digits: '1',
    });

    expect(result.statusHandled).toBe('CONFIRMED_VOICE');
    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AppointmentStatus.CONFIRMED,
          confirmationSource: 'voice_dtmf',
        }),
      }),
    );
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'appointment.confirmed',
      expect.objectContaining({
        appointment_id: 'APT-98214',
        channel: 'VOICE_DTMF',
      }),
    );
  });

  // CASE 3: Cancelled via SMS
  it('Case 3: should handle patient cancelling via SMS ("2")', async () => {
    const result = await service.handleInboundSms({
      From: '+14155552671',
      Body: '2',
    });

    expect(result.statusHandled).toBe('CANCELLED');
    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AppointmentStatus.CANCELLED,
        }),
      }),
    );
    expect(remindersService.cancelPendingReminders).toHaveBeenCalled();
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'appointment.cancelled',
      expect.objectContaining({
        appointment_id: 'APT-98214',
        slot_released_early: true,
      }),
    );
  });

  // CASE 4: Null Case / Timeout (Flag as AT_RISK)
  it('Case 4: should flag unanswered appointments near slot as AT_RISK', async () => {
    const result = await service.flagUnansweredAppointments('tenant-123');

    expect(result.atRiskCount).toBe(1);
    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: AppointmentStatus.AT_RISK },
      }),
    );
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'appointment.at_risk',
      expect.objectContaining({
        appointment_id: 'APT-98214',
        status: 'AT_RISK',
      }),
    );
  });

  // CASE 5: Unrecognized / Invalid Text (Bot Assistance)
  it('Case 5: should return clarification bot SMS on unrecognized text without changing status', async () => {
    const result = await service.handleInboundSms({
      From: '+14155552671',
      Body: 'Thank you very much! 😊',
    });

    expect(result.statusHandled).toBe('UNKNOWN_REPLY_ASSISTED');
    expect(result.twiml).toContain('Please reply 1 to Confirm');
    // Appointment status must NOT be updated
    expect(prisma.appointment.update).not.toHaveBeenCalled();
    // Patient response logged as UNKNOWN
    expect(prisma.patientResponse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: PatientResponseAction.UNKNOWN,
        }),
      }),
    );
  });

  // CASE 6: Landline Detection (Twilio Error 21614)
  it('Case 6: should escalate to Voice IVR when carrier reports landline error 21614', async () => {
    const result = await service.handleDeliveryStatus({
      To: '+14155552671',
      ErrorCode: '21614',
      MessageStatus: 'failed',
    });

    expect(result.statusHandled).toBe('LANDLINE_ESCALATED');
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'reminder.landline_escalated',
      expect.objectContaining({
        appointment_id: 'APT-98214',
      }),
    );
  });

  // CASE 7: Voicemail / Answering Machine Detected (AMD)
  it('Case 7: should leave informational message when answering machine is detected', async () => {
    const result = await service.handleInboundVoice({
      From: '+14155552671',
      AnsweredBy: 'machine_start',
    });

    expect(result.statusHandled).toBe('VOICEMAIL_LEFT');
    expect(result.twiml).toContain('Please call your clinic to confirm');
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'reminder.voicemail_left',
      expect.objectContaining({
        answered_by: 'machine_start',
      }),
    );
  });

  // CASE 8: TCPA Opt-Out ("STOP")
  it('Case 8: should purge all scheduled reminders when patient replies "STOP"', async () => {
    const result = await service.handleInboundSms({
      From: '+14155552671',
      Body: 'STOP',
    });

    expect(result.statusHandled).toBe('OPTED_OUT');
    expect(result.twiml).toContain('unsubscribed from appointment reminders');
    expect(remindersService.cancelPendingReminders).toHaveBeenCalled();
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      'tenant-123',
      'patient.opted_out',
      expect.objectContaining({
        action: 'OPT_OUT',
      }),
    );
  });
});
