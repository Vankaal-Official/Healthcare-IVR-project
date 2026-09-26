import { Test, TestingModule } from '@nestjs/testing';
import { VoiceAgentService } from './voice-agent.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { WebhooksDispatcher } from '../webhooks/webhooks.dispatcher';
import { AppointmentStatus, PatientResponseAction, ResponseChannel } from '@prisma/client';

describe('VoiceAgentService', () => {
  let service: VoiceAgentService;
  let prisma: any;
  let remindersService: any;
  let dispatcher: any;

  const mockTenant = { id: 'tenant-100', name: 'Zocdoc Clinic' };
  const mockPractice = { id: 'prac-100', name: 'Downtown Health', phone: '+18005550199' };
  const mockAppointment = {
    id: 'apt-001',
    tenantId: 'tenant-100',
    externalAppointmentId: 'APT-98214',
    doctorName: 'Dr. Sarah Jenkins',
    patientName: 'Eleanor Vance',
    patientPhone: '+14155552671',
    appointmentDate: '2026-10-15',
    appointmentTime: '10:00:00',
    timezone: 'America/New_York',
    appointmentTimestamp: new Date('2026-10-15T14:00:00.000Z'),
    status: AppointmentStatus.SCHEDULED,
    tenant: mockTenant,
    practice: mockPractice,
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findFirst: jest.fn().mockResolvedValue(mockAppointment),
        findMany: jest.fn().mockResolvedValue([mockAppointment]),
        update: jest.fn().mockImplementation((args) => ({
          ...mockAppointment,
          ...args.data,
        })),
      },
      patientResponse: {
        create: jest.fn().mockResolvedValue({ id: 'resp-001' }),
      },
    };

    remindersService = {
      cancelPendingReminders: jest.fn().mockResolvedValue({ count: 1 }),
      rescheduleReminders: jest.fn().mockResolvedValue([]),
    };

    dispatcher = {
      dispatch: jest.fn().mockResolvedValue({ id: 'wh-001', status: 'pending' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoiceAgentService,
        { provide: PrismaService, useValue: prisma },
        { provide: RemindersService, useValue: remindersService },
        { provide: WebhooksDispatcher, useValue: dispatcher },
      ],
    }).compile();

    service = module.get<VoiceAgentService>(VoiceAgentService);
  });

  describe('verifyIdentity', () => {
    it('should verify identity when patient phone matches', async () => {
      const result = await service.verifyIdentity({ patientPhone: '+14155552671' });
      expect(result.verified).toBe(true);
      expect(result.patientName).toBe('Eleanor Vance');
      expect(result.doctorName).toBe('Dr. Sarah Jenkins');
    });

    it('should fail verification if last 4 digits do not match', async () => {
      const result = await service.verifyIdentity({
        patientPhone: '+14155552671',
        last4Digits: '9999',
      });
      expect(result.verified).toBe(false);
    });

    it('should succeed verification if last 4 digits match', async () => {
      const result = await service.verifyIdentity({
        patientPhone: '+14155552671',
        last4Digits: '2671',
      });
      expect(result.verified).toBe(true);
    });
  });

  describe('confirmAppointment', () => {
    it('should confirm appointment, cancel future reminders, and dispatch Zocdoc webhook', async () => {
      const result = await service.confirmAppointment({
        patientPhone: '+14155552671',
        reminderPreference: 'sms',
      });

      expect(result.success).toBe(true);
      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockAppointment.id },
          data: expect.objectContaining({
            status: AppointmentStatus.CONFIRMED,
            confirmationSource: 'voice_ai_vapi',
          }),
        }),
      );
      expect(remindersService.cancelPendingReminders).toHaveBeenCalled();
      expect(dispatcher.dispatch).toHaveBeenCalledWith(
        mockAppointment.tenantId,
        'appointment.confirmed',
        expect.objectContaining({
          appointment_id: mockAppointment.externalAppointmentId,
          status: 'CONFIRMED',
        }),
      );
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available upcoming slots for clinic guidance', async () => {
      const result: any = await service.getAvailableSlots({ patientPhone: '+14155552671' });
      expect(result).toHaveProperty('doctorName');
      expect(result).toHaveProperty('spokenGuidance');
    });
  });

  describe('rescheduleAppointment', () => {
    it('should record reschedule request and alert clinic for follow-up', async () => {
      const newTimestamp = '2026-10-20T15:00:00.000Z';
      const result = await service.rescheduleAppointment({
        patientPhone: '+14155552671',
        newSlotTimestamp: newTimestamp,
        barrierReason: 'transportation',
      });

      expect(result.success).toBe(true);
      expect(dispatcher.dispatch).toHaveBeenCalledWith(
        mockAppointment.tenantId,
        'appointment.reschedule_requested',
        expect.objectContaining({
          appointment_id: mockAppointment.externalAppointmentId,
        }),
      );
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment, cancel reminders, and release slot on Zocdoc', async () => {
      const result = await service.cancelAppointment({
        patientPhone: '+14155552671',
        barrierReason: 'schedule conflict',
      });

      expect(result.success).toBe(true);
      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: AppointmentStatus.CANCELLED,
            cancellationReason: 'schedule conflict',
          }),
        }),
      );
      expect(remindersService.cancelPendingReminders).toHaveBeenCalled();
      expect(dispatcher.dispatch).toHaveBeenCalledWith(
        mockAppointment.tenantId,
        'appointment.cancelled',
        expect.objectContaining({
          status: 'CANCELLED',
        }),
      );
    });
  });

  describe('optOut', () => {
    it('should opt out patient from future automated reminders', async () => {
      const result = await service.optOut({ patientPhone: '+14155552671' });
      expect(result.success).toBe(true);
      expect(remindersService.cancelPendingReminders).toHaveBeenCalled();
      expect(dispatcher.dispatch).toHaveBeenCalledWith(
        mockAppointment.tenantId,
        'patient.opted_out',
        expect.any(Object),
      );
    });
  });

  describe('handleVapiWebhook', () => {
    it('should process tool-calls message from Vapi server URL', async () => {
      const webhookPayload = {
        message: {
          type: 'tool-calls',
          toolCalls: [
            {
              id: 'call_abc_123',
              type: 'function',
              function: {
                name: 'confirmAppointment',
                arguments: {
                  patientPhone: '+14155552671',
                  reminderPreference: 'sms',
                },
              },
            },
          ],
          call: {
            customer: {
              number: '+14155552671',
            },
          },
        },
      };

      const response = await service.handleVapiWebhook(webhookPayload);
      expect(response.results).toBeDefined();
      expect(response.results?.[0].toolCallId).toBe('call_abc_123');
      expect(response.results?.[0].result.success).toBe(true);
    });
  });
});
