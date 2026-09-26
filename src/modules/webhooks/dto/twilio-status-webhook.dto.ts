import { IsOptional, IsString } from 'class-validator';

export class TwilioStatusWebhookDto {
  @IsString()
  @IsOptional()
  MessageSid?: string;

  @IsString()
  @IsOptional()
  MessageStatus?: string; // queued, sent, delivered, undelivered, failed

  @IsString()
  @IsOptional()
  To?: string; // Destination patient number

  @IsString()
  @IsOptional()
  From?: string;

  @IsString()
  @IsOptional()
  ErrorCode?: string; // e.g. "21614" (Cannot route SMS to landline)

  @IsString()
  @IsOptional()
  ErrorMessage?: string;
}
