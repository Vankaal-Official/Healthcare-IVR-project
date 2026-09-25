import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyIdentityDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  birthYear?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  last4Digits?: string;
}

export class ConfirmAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  reminderPreference?: 'sms' | 'voice' | 'both' | 'none' | string;

  @IsOptional()
  preference?: string;
}

export class AvailableSlotsDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  preferredWeek?: string; // 'this_week', 'next_week'

  @IsString()
  @IsOptional()
  preferredDate?: string;

  @IsString()
  @IsOptional()
  timePeriod?: string; // 'morning', 'afternoon', 'evening'

  @IsOptional()
  date?: string;

  @IsOptional()
  time?: string;
}

export class RescheduleAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  newSlotTimestamp?: string;

  @IsString()
  @IsOptional()
  newSlot?: string;

  @IsString()
  @IsOptional()
  slotId?: string;

  @IsString()
  @IsOptional()
  preferredDate?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  barrierReason?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CancelAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  barrierReason?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class OptOutDto {
  @IsString()
  @IsNotEmpty()
  patientPhone: string;
}

export class VapiWebhookDto {
  @IsOptional()
  message?: {
    type?: string;
    toolCalls?: Array<{
      id: string;
      type: string;
      function: {
        name: string;
        arguments: Record<string, any>;
      };
    }>;
    call?: {
      id?: string;
      customer?: {
        number?: string;
        name?: string;
      };
    };
  };
}
