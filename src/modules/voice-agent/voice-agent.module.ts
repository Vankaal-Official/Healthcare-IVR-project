import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RemindersModule } from '../reminders/reminders.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { VoiceAgentController } from './voice-agent.controller';
import { VoiceAgentService } from './voice-agent.service';

@Module({
  imports: [
    PrismaModule,
    RemindersModule,
    WebhooksModule,
  ],
  controllers: [VoiceAgentController],
  providers: [VoiceAgentService],
  exports: [VoiceAgentService],
})
export class VoiceAgentModule {}
