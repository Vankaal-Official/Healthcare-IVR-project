import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface OutboundWebhookJobData {
  webhookEventId: string;
  tenantId: string;
  eventType: string;
  targetUrl: string;
  payload: Record<string, any>;
  signingSecret: string;
}

@Injectable()
export class WebhooksDispatcher {
  private readonly logger = new Logger(WebhooksDispatcher.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhooksQueue: Queue,
  ) {}

  /**
   * Enqueues an outbound webhook event with BullMQ retry protection and PostgreSQL tracking
   */
  async dispatch(
    tenantId: string,
    eventType: string,
    payload: Record<string, any>,
    targetUrl: string = 'https://api.zocdoc.com/v2/events',
    signingSecret: string = 'vk_sec_partner_signature_key',
  ) {
    // 1. Persist initial WebhookEvent in PostgreSQL with status 'pending'
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        tenantId,
        eventType,
        status: 'pending',
        attemptCount: 0,
        payload,
      },
    });

    const jobData: OutboundWebhookJobData = {
      webhookEventId: webhookEvent.id,
      tenantId,
      eventType,
      targetUrl,
      payload,
      signingSecret,
    };

    // 2. Add job to BullMQ queue with exponential backoff retries (3 attempts)
    const job = await this.webhooksQueue.add(`webhook:${eventType}`, jobData, {
      jobId: `webhook:${webhookEvent.id}`,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 15s, 30s
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(
      `[Outbound Webhook] Enqueued event "${eventType}" for tenant "${tenantId}" (BullMQ Job ID: ${job.id})`,
    );

    return webhookEvent;
  }
}
