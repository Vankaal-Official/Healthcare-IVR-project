import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [TenantsModule, RemindersModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
