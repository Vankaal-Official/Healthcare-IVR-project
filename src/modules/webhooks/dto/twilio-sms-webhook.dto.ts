import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TwilioSmsWebhookDto {
  @IsString()
  @IsNotEmpty()
  From: string; // Patient phone number e.g. +14155552671

  @IsString()
  @IsOptional()
  To?: string; // Healthcare twilio phone number

  @IsString()
  @IsNotEmpty()
  Body: string; // Patient incoming text e.g. "1", "2", "STOP", "Thanks"

  @IsString()
  @IsOptional()
  MessageSid?: string;

  @IsString()
  @IsOptional()
  AccountSid?: string;
}
