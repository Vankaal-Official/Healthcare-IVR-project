import { Body, Controller, Header, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { WebhooksService } from './webhooks.service';
import { TwilioSmsWebhookDto } from './dto/twilio-sms-webhook.dto';
import { TwilioVoiceWebhookDto } from './dto/twilio-voice-webhook.dto';
import { TwilioStatusWebhookDto } from './dto/twilio-status-webhook.dto';

@ApiTags('Webhooks')
@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * INBOUND TWILIO SMS WEBHOOK
   * Receives patient replies (1, 2, STOP, etc.)
   */
  @Public()
  @Post('twilio/sms')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/xml')
  @ApiOperation({ summary: 'Twilio Inbound SMS Webhook callback' })
  @ApiResponse({ status: 200, description: 'TwiML response returned to Twilio' })
  async handleTwilioSms(@Body() body: TwilioSmsWebhookDto): Promise<string> {
    const result = await this.webhooksService.handleInboundSms(body);
    return result.twiml;
  }

  /**
   * INBOUND TWILIO VOICE IVR WEBHOOK
   * Receives patient DTMF keypresses (1 to confirm, 2 to cancel) or AMD voicemail detections
   */
  @Public()
  @Post('twilio/voice')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/xml')
  @ApiOperation({ summary: 'Twilio Inbound Voice IVR Webhook callback' })
  @ApiResponse({ status: 200, description: 'TwiML voice response returned to Twilio' })
  async handleTwilioVoice(@Body() body: TwilioVoiceWebhookDto): Promise<string> {
    const result = await this.webhooksService.handleInboundVoice(body);
    return result.twiml;
  }

  /**
   * TWILIO STATUS CALLBACK WEBHOOK
   * Receives message delivery statuses (delivered, undelivered, landline error 21614)
   */
  @Public()
  @Post('twilio/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Twilio Carrier Delivery Status Callback' })
  async handleTwilioStatus(@Body() body: TwilioStatusWebhookDto) {
    return this.webhooksService.handleDeliveryStatus(body);
  }

  /**
   * CRON / AUTOMATED MONITOR: Check and flag unanswered appointments as AT_RISK (Case 4: Null Case)
   */
  @Public()
  @Post('cron/check-at-risk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger check for unanswered appointments approaching scheduled time' })
  async checkAtRisk(@Query('tenantId') tenantId?: string) {
    return this.webhooksService.flagUnansweredAppointments(tenantId);
  }
}
