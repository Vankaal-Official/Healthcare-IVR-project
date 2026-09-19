import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './common/config/configuration';
import { validate } from './common/config/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { HealthModule } from './modules/health/health.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { PhiMaskingLoggerInterceptor } from './common/interceptors/phi-masking-logger.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    RemindersModule,
    AppointmentsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PhiMaskingLoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
