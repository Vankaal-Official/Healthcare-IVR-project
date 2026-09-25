import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { VoiceAgentService } from './voice-agent.service';
import {
  VerifyIdentityDto,
  ConfirmAppointmentDto,
  AvailableSlotsDto,
  RescheduleAppointmentDto,
  CancelAppointmentDto,
  OptOutDto,
  VapiWebhookDto,
} from './dto/voice-agent.dto';

@ApiTags('Voice Agent (Vapi.ai)')
@Controller('voice-agent')
export class VoiceAgentController {
  constructor(private readonly voiceAgentService: VoiceAgentService) {}

  @Public()
  @Post('verify-identity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'HIPAA identity check for Voice AI agent' })
  async verifyIdentity(@Body() dto: VerifyIdentityDto) {
    return this.voiceAgentService.verifyIdentity(dto);
  }

  @Public()
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Voice AI tool: Confirm patient appointment' })
  async confirmAppointment(@Body() dto: ConfirmAppointmentDto) {
    return this.voiceAgentService.confirmAppointment(dto);
  }

  @Public()
  @Post('available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Voice AI tool: Get open appointment slots for rescheduling' })
  async getAvailableSlots(@Body() dto: AvailableSlotsDto) {
    return this.voiceAgentService.getAvailableSlots(dto);
  }

  @Public()
  @Post('reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Voice AI tool: Reschedule appointment to chosen slot' })
  async rescheduleAppointment(@Body() dto: RescheduleAppointmentDto) {
    return this.voiceAgentService.rescheduleAppointment(dto);
  }

  @Public()
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Voice AI tool: Cancel appointment with barrier feedback' })
  async cancelAppointment(@Body() dto: CancelAppointmentDto) {
    return this.voiceAgentService.cancelAppointment(dto);
  }

  @Public()
  @Post('opt-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Voice AI tool: TCPA opt-out stop automated calls' })
  async optOut(@Body() dto: OptOutDto) {
    return this.voiceAgentService.optOut(dto);
  }

  @Public()
  @Post('vapi-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unified Vapi.ai Server URL tool-calls webhook endpoint' })
  async handleVapiWebhook(@Body() dto: VapiWebhookDto) {
    return this.voiceAgentService.handleVapiWebhook(dto);
  }
}
