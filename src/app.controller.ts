import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Root')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root - Provides documentation links' })
  getRoot(@Res() res: Response) {
    return res.json({
      name: 'Van-Kaal Healthcare Appointment Reminder API',
      version: '1.0.0',
      status: 'online',
      documentation: '/docs',
      endpoints: {
        swagger_ui: 'http://localhost:3000/docs',
        health_check: 'http://localhost:3000/v1/health',
        appointments: 'http://localhost:3000/v1/appointments',
        tenants: 'http://localhost:3000/v1/tenants',
      },
    });
  }
}
