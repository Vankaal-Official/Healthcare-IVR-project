import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RemindersService } from './reminders.service';
import { RemindersProcessor } from './reminders.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [RemindersService, RemindersProcessor],
  exports: [RemindersService, BullModule],
})
export class RemindersModule {}
