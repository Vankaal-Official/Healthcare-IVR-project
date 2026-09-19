import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus, ReminderChannel, ReminderStatus } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: any;
  let tenantsService: any;
  let remindersService: any;

  beforeEach(async () => {
    prisma = {
      appointment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      auditEvent: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    tenantsService = {
      getOrCreatePractice: jest.fn().mockResolvedValue({
        id: 'practice-uuid-1',
        timezone: 'America/New_York',
      }),
    };

    remindersService = {
      createRemindersForAppointment: jest.fn().mockResolvedValue({
        plan: {},
        reminders: [
          {
            id: 'rem-sms-1',
            channel: ReminderChannel.SMS,
            status: ReminderStatus.SCHEDULED,
            scheduledFor: new Date('2026-09-28T14:30:00.000Z'),
          },
          {
            id: 'rem-voice-1',
            channel: ReminderChannel.VOICE,
            status: ReminderStatus.SCHEDULED,
            scheduledFor: new Date('2026-09-28T15:00:00.000Z'),
          },
        ],
      }),
      cancelPendingReminders: jest.fn().mockResolvedValue({ count: 2 }),
      rescheduleReminders: jest.fn().mockResolvedValue({ reminders: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantsService, useValue: tenantsService },
        { provide: RemindersService, useValue: remindersService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should register an appointment and format response matching Section 3.2', async () => {
    const dto: CreateAppointmentDto = {
      appointment_id: 'APT-98231',
      patient: {
        name: 'John Doe',
        phone: '+14155551234',
      },
      appointment: {
        date: '2026-09-28',
        time: '15:30:00',
        timezone: 'America/New_York',
        doctor: 'Dr. Michael Smith',
        practice_id: 'practice_001',
      },
    };

    prisma.appointment.findUnique.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue({
      id: 'apt-uuid-1',
      tenantId: 'tenant-1',
      practiceId: 'practice-uuid-1',
      externalAppointmentId: 'APT-98231',
      status: AppointmentStatus.SCHEDULED,
      appointmentDate: '2026-09-28',
      appointmentTime: '15:30:00',
      doctorName: 'Dr. Michael Smith',
      patientName: 'John Doe',
      patientPhone: '+14155551234',
    });

    const response = await service.create('tenant-1', dto, 'idempotency-key-1');

    expect(response.success).toBe(true);
    expect(response.appointment_id).toBe('APT-98231');
    expect(response.status).toBe('scheduled');
    expect(response.reminders.sms).toBeDefined();
    expect(response.reminders.sms.status).toBe('scheduled');
    expect(response.reminders.voice).toBeDefined();
    expect(response.reminders.voice.status).toBe('scheduled');
  });

  it('should cancel an appointment and suppress pending reminders', async () => {
    prisma.appointment.findFirst.mockResolvedValue({
      id: 'apt-uuid-1',
      externalAppointmentId: 'APT-98231',
      status: AppointmentStatus.SCHEDULED,
    });

    prisma.appointment.update.mockResolvedValue({
      id: 'apt-uuid-1',
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    const res = await service.cancel('tenant-1', 'APT-98231', { reason: 'Emergency' });

    expect(res.success).toBe(true);
    expect(res.status).toBe('cancelled');
    expect(remindersService.cancelPendingReminders).toHaveBeenCalledWith(
      'tenant-1',
      'apt-uuid-1',
      'Emergency',
    );
  });
});
