import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RemindersModule } from '../reminders/reminders.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhooksDispatcher } from './webhooks.dispatcher';
import { WebhooksProcessor } from './webhooks.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    PrismaModule,
    RemindersModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksDispatcher, WebhooksProcessor],
  exports: [WebhooksService, WebhooksDispatcher],
})
export class WebhooksModule {}
