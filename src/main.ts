import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('port', 3000);
  const apiPrefix = configService.get<string>('apiPrefix', 'v1');
  const corsOrigin = configService.get<string>('security.corsOrigin', '*');
  const enableSwagger = configService.get<boolean>('swagger.enabled', true);

  // Security Headers via Helmet
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API Versioning / Prefix: /v1
  app.setGlobalPrefix(apiPrefix);

  // Request Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Van-Kaal Healthcare Appointment Reminder API')
      .setDescription(
        'Production-Grade Healthcare Appointment Reminder API platform. Reusable integration for patient SMS reminders, IVR calls, late bookings, and outcome webhooks.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'Pass your tenant API key as Bearer token',
        },
        'bearer',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'Pass your tenant API key in the X-API-Key header',
        },
        'api-key',
      )
      .addTag('Appointments', 'Register, reschedule, cancel, and query appointments')
      .addTag('Tenants & Practices', 'Multi-tenant organization and clinic management')
      .addTag('Health', 'Operational diagnostics and liveness probes')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log(`OpenAPI documentation generated at http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`Healthcare Reminder API running on: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
