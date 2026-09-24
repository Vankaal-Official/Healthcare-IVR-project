import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TwilioVoiceWebhookDto {
  @IsString()
  @IsNotEmpty()
  From: string; // Calling or dialed patient phone number

  @IsString()
  @IsOptional()
  To?: string;

  @IsString()
  @IsOptional()
  Digits?: string; // DTMF key pressed e.g. "1" (Confirm) or "2" (Cancel)

  @IsString()
  @IsOptional()
  SpeechResult?: string; // Transcribed speech e.g. "yes", "confirm", "cancel", "English"

  @IsString()
  @IsOptional()
  Confidence?: string; // Speech recognition confidence score (0.0 to 1.0)

  @IsString()
  @IsOptional()
  CallSid?: string;

  @IsString()
  @IsOptional()
  CallStatus?: string; // in-progress, completed, busy, no-answer

  @IsString()
  @IsOptional()
  AnsweredBy?: string; // human, machine_start, machine_end_beep, machine_end_other
}
