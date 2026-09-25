import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List all appointments for dashboard display',
    description: 'Returns real-time appointments formatted with reminders and confirmation statuses for the clinic portal.',
  })
  async findAll(@TenantId() tenantId?: string) {
    return this.appointmentsService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({
    summary: 'Register an appointment and schedule reminders',
    description:
      'Called by the customer backend when a booking is created. Accepts appointment details, calculates reminder schedules (SMS T-60, IVR T-30, and late booking rules), and persists reminder records.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique client idempotency token for safe retries (e.g. booking-APT-98231-v1)',
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment registered and reminders scheduled successfully',
  })
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateAppointmentDto,
    @Headers() headers: Record<string, string>,
  ) {
    const idempotencyKey = headers['idempotency-key'] || headers['Idempotency-Key'];
    return this.appointmentsService.create(tenantId, dto, idempotencyKey);
  }

  @Get(':appointment_id')
  @ApiOperation({
    summary: 'Read current Van-Kaal status and reminder state',
    description: 'Fetches appointment state and scheduled/sent reminder statuses for the authenticated tenant.',
  })
  @ApiParam({
    name: 'appointment_id',
    example: 'APT-98231',
    description: 'The external appointment identifier',
  })
  async findOne(
    @TenantId() tenantId: string,
    @Param('appointment_id') appointmentId: string,
  ) {
    return this.appointmentsService.findById(tenantId, appointmentId);
  }

  @Post(':appointment_id/cancel')
  @ApiOperation({
    summary: 'Cancel appointment and suppress future reminders',
    description: 'Marks appointment as cancelled and cancels all pending SMS/IVR reminder jobs.',
  })
  @ApiParam({
    name: 'appointment_id',
    example: 'APT-98231',
    description: 'The external appointment identifier',
  })
  async cancel(
    @TenantId() tenantId: string,
    @Param('appointment_id') appointmentId: string,
    @Body() dto?: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(tenantId, appointmentId, dto);
  }

  @Post(':appointment_id/reschedule')
  @ApiOperation({
    summary: 'Reschedule appointment and recalculate reminder jobs',
    description: 'Updates appointment date/time/timezone, cancels previous reminders, and calculates new reminder jobs.',
  })
  @ApiParam({
    name: 'appointment_id',
    example: 'APT-98231',
    description: 'The external appointment identifier',
  })
  async reschedule(
    @TenantId() tenantId: string,
    @Param('appointment_id') appointmentId: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(tenantId, appointmentId, dto);
  }
}
