import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ReminderChannel, ReminderStatus } from '@prisma/client';

import { getQueueToken } from '@nestjs/bullmq';

describe('RemindersService (Schedule & Late Booking Engine)', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal: any) => defaultVal,
          },
        },
        {
          provide: getQueueToken('reminders'),
          useValue: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  it('should schedule IVR at T-60 and SMS at T-30 when appointment is > 60 min away', () => {
    const now = new Date('2026-09-28T10:00:00Z');
    const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // 330 minutes away

    const plan = service.calculateSchedule(appointmentUtc, now);

    expect(plan.isLateBooking).toBe(false);
    expect(plan.isPastAppointment).toBe(false);

    // Voice scheduled at T-60 -> 14:30
    expect(plan.voice?.channel).toBe(ReminderChannel.VOICE);
    expect(plan.voice?.status).toBe(ReminderStatus.SCHEDULED);
    expect(plan.voice?.scheduledFor.toISOString()).toBe('2026-09-28T14:30:00.000Z');

    // SMS scheduled at T-30 -> 15:00
    expect(plan.sms?.channel).toBe(ReminderChannel.SMS);
    expect(plan.sms?.status).toBe(ReminderStatus.SCHEDULED);
    expect(plan.sms?.scheduledFor.toISOString()).toBe('2026-09-28T15:00:00.000Z');
  });

  it('should trigger immediate IVR and schedule SMS at T-30 when booked 30-60 min before', () => {
    const now = new Date('2026-09-28T14:45:00Z');
    const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // 45 minutes away

    const plan = service.calculateSchedule(appointmentUtc, now);

    expect(plan.isLateBooking).toBe(true);
    // IVR scheduled immediately (now)
    expect(plan.voice?.scheduledFor.toISOString()).toBe(now.toISOString());
    expect(plan.voice?.status).toBe(ReminderStatus.SCHEDULED);
    // SMS scheduled for T-30 -> 15:00
    expect(plan.sms?.scheduledFor.toISOString()).toBe('2026-09-28T15:00:00.000Z');
    expect(plan.sms?.status).toBe(ReminderStatus.SCHEDULED);
  });

  it('should trigger immediate IVR and immediate SMS when booked 5-30 min before', () => {
    const now = new Date('2026-09-28T15:15:00Z');
    const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // 15 minutes away

    const plan = service.calculateSchedule(appointmentUtc, now);

    expect(plan.isLateBooking).toBe(true);
    expect(plan.voice?.scheduledFor.toISOString()).toBe(now.toISOString());
    expect(plan.voice?.status).toBe(ReminderStatus.SCHEDULED);
    expect(plan.sms?.scheduledFor.toISOString()).toBe(now.toISOString());
    expect(plan.sms?.status).toBe(ReminderStatus.SCHEDULED);
  });

  it('should skip IVR when booked with less than minimum voice lead time (< 5 min)', () => {
    const now = new Date('2026-09-28T15:28:00Z');
    const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // 2 minutes away

    const plan = service.calculateSchedule(appointmentUtc, now);

    expect(plan.isLateBooking).toBe(true);
    expect(plan.voice?.status).toBe(ReminderStatus.SKIPPED);
    expect(plan.sms?.scheduledFor.toISOString()).toBe(now.toISOString());
  });

  it('should not schedule reminders if appointment is already in the past', () => {
    const now = new Date('2026-09-28T16:00:00Z');
    const appointmentUtc = new Date('2026-09-28T15:30:00Z'); // -30 minutes away

    const plan = service.calculateSchedule(appointmentUtc, now);

    expect(plan.isPastAppointment).toBe(true);
    expect(plan.sms).toBeUndefined();
    expect(plan.voice).toBeUndefined();
  });
});
