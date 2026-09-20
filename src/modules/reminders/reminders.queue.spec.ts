import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { RemindersProcessor } from './reminders.processor';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { AppointmentStatus, ReminderChannel, ReminderStatus } from '@prisma/client';
import { Job } from 'bullmq';

describe('BullMQ Delayed Reminder Queue & Processor', () => {
  let remindersService: RemindersService;
  let remindersProcessor: RemindersProcessor;
  let mockQueue: any;
  let mockPrisma: any;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
      remove: jest.fn().mockResolvedValue(1),
    };

    mockPrisma = {
      reminder: {
        create: jest.fn().mockImplementation((args) => ({
          id: 'rem-uuid-1',
          ...args.data,
        })),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn().mockImplementation((args) => ({
          id: args.where.id,
          ...args.data,
        })),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      appointment: {
        findFirst: jest.fn(),
      },
      auditEvent: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        RemindersProcessor,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal: any) => defaultVal,
          },
        },
        {
          provide: getQueueToken('reminders'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    remindersService = module.get<RemindersService>(RemindersService);
    remindersProcessor = module.get<RemindersProcessor>(RemindersProcessor);
  });

  describe('Delayed Job Enqueuing (T-60 and T-30)', () => {
    it('should enqueue delayed BullMQ jobs with deterministic job IDs and calculated delays', async () => {
      const now = new Date('2026-09-28T12:00:00Z');
      const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // 210 mins away

      await remindersService.createRemindersForAppointment(
        'tenant-1',
        'apt-1',
        appointmentUtc,
        now,
      );

      // Verify Prisma created 2 reminder records (SMS and Voice)
      expect(mockPrisma.reminder.create).toHaveBeenCalledTimes(2);

      // Verify BullMQ queue.add was called for both reminders
      expect(mockQueue.add).toHaveBeenCalledTimes(2);

      // Verify job options have deterministic jobId and positive delay
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send_reminder',
        expect.objectContaining({
          appointmentId: 'apt-1',
          tenantId: 'tenant-1',
          channel: ReminderChannel.SMS,
        }),
        expect.objectContaining({
          jobId: 'reminder:rem-uuid-1',
          delay: expect.any(Number),
          attempts: 3,
        }),
      );
    });
  });

  describe('Job Removal on Cancellation', () => {
    it('should remove pending jobs from BullMQ queue when appointment is cancelled', async () => {
      mockPrisma.reminder.findMany.mockResolvedValue([
        { id: 'rem-sms-1', status: ReminderStatus.SCHEDULED },
        { id: 'rem-voice-1', status: ReminderStatus.SCHEDULED },
      ]);

      await remindersService.cancelPendingReminders('tenant-1', 'apt-1', 'Patient cancelled');

      // Verify queue.remove was called for both deterministic job IDs
      expect(mockQueue.remove).toHaveBeenCalledWith('reminder:rem-sms-1');
      expect(mockQueue.remove).toHaveBeenCalledWith('reminder:rem-voice-1');

      // Verify DB updateMany marked them as CANCELLED
      expect(mockPrisma.reminder.updateMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          appointmentId: 'apt-1',
          status: ReminderStatus.SCHEDULED,
        },
        data: {
          status: ReminderStatus.CANCELLED,
          failureReason: 'Patient cancelled',
        },
      });
    });
  });

  describe('RemindersProcessor (Cancellation Race Protection)', () => {
    it('should abort reminder if appointment was CANCELLED prior to job execution', async () => {
      const mockJob = {
        id: 'reminder:rem-1',
        data: {
          reminderId: 'rem-1',
          appointmentId: 'apt-1',
          tenantId: 'tenant-1',
          channel: ReminderChannel.SMS,
        },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as unknown as Job;

      // Appointment is marked CANCELLED in DB
      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: 'apt-1',
        externalAppointmentId: 'APT-98231',
        status: AppointmentStatus.CANCELLED,
      });

      const result = await remindersProcessor.process(mockJob);

      expect(result).toEqual({ status: 'aborted_cancelled' });

      // Verify reminder was marked CANCELLED in DB
      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'rem-1' },
        data: {
          status: ReminderStatus.CANCELLED,
          failureReason: 'Aborted: Appointment cancelled before execution',
        },
      });
    });

    it('should mark reminder SENT and record audit event on successful dispatch', async () => {
      const mockJob = {
        id: 'reminder:rem-1',
        data: {
          reminderId: 'rem-1',
          appointmentId: 'apt-1',
          tenantId: 'tenant-1',
          channel: ReminderChannel.SMS,
        },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as unknown as Job;

      mockPrisma.appointment.findFirst.mockResolvedValue({
        id: 'apt-1',
        externalAppointmentId: 'APT-98231',
        status: AppointmentStatus.SCHEDULED,
        patientPhone: '+14155551234',
        doctorName: 'Dr. Michael Smith',
        practice: { name: 'Downtown Branch' },
      });

      mockPrisma.reminder.findUnique.mockResolvedValue({
        id: 'rem-1',
        status: ReminderStatus.SCHEDULED,
      });

      const result = await remindersProcessor.process(mockJob);

      expect(result.success).toBe(true);
      expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'rem-1' },
        data: expect.objectContaining({
          status: ReminderStatus.SENT,
          sentAt: expect.any(Date),
        }),
      });

      expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'reminder.sms.sent',
          resource: 'reminder',
        }),
      });
    });
  });
});
