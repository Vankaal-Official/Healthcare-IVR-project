import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { WebhooksDispatcher } from './webhooks.dispatcher';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('WebhooksDispatcher (BullMQ Outbound Queue)', () => {
  let dispatcher: WebhooksDispatcher;
  let prisma: any;
  let queue: any;

  beforeEach(async () => {
    prisma = {
      webhookEvent: {
        create: jest.fn().mockResolvedValue({
          id: 'evt-1001',
          tenantId: 'tenant-123',
          eventType: 'appointment.confirmed',
          status: 'pending',
          attemptCount: 0,
        }),
      },
    };

    queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-999' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksDispatcher,
        { provide: PrismaService, useValue: prisma },
        { provide: getQueueToken('webhooks'), useValue: queue },
      ],
    }).compile();

    dispatcher = module.get<WebhooksDispatcher>(WebhooksDispatcher);
  });

  it('should persist WebhookEvent in PostgreSQL with status pending', async () => {
    await dispatcher.dispatch('tenant-123', 'appointment.confirmed', {
      appointment_id: 'APT-100',
    });

    expect(prisma.webhookEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-123',
          eventType: 'appointment.confirmed',
          status: 'pending',
        }),
      }),
    );
  });

  it('should enqueue outbound webhook into BullMQ with 3 retries and exponential backoff', async () => {
    await dispatcher.dispatch('tenant-123', 'appointment.confirmed', {
      appointment_id: 'APT-100',
    });

    expect(queue.add).toHaveBeenCalledWith(
      'webhook_appointment.confirmed',
      expect.objectContaining({
        webhookEventId: 'evt-1001',
        eventType: 'appointment.confirmed',
        targetUrl: 'https://api.zocdoc.com/v2/events',
      }),
      expect.objectContaining({
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }),
    );
  });
});
