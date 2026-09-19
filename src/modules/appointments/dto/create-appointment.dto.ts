import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class PatientInfoDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the patient' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+14155551234', description: 'E.164 formatted patient phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid E.164 international format (e.g. +14155551234)',
  })
  phone: string;
}

export class AppointmentDetailDto {
  @ApiProperty({ example: '2026-09-28', description: 'Appointment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '15:30:00', description: 'Appointment time in 24-hour format (HH:MM:SS)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'Time must be in HH:MM:SS or HH:MM 24-hour format',
  })
  time: string;

  @ApiProperty({ example: 'America/New_York', description: 'IANA Timezone name' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({ example: 'Dr. Michael Smith', description: 'Provider / Doctor name' })
  @IsString()
  @IsNotEmpty()
  doctor: string;

  @ApiProperty({ example: 'practice_001', description: 'Customer EHR Practice / Location identifier' })
  @IsString()
  @IsNotEmpty()
  practice_id: string;
}

export class CreateAppointmentDto {
  @ApiProperty({ example: 'APT-98231', description: 'Unique customer appointment ID from source system' })
  @IsString()
  @IsNotEmpty()
  appointment_id: string;

  @ApiProperty({ type: PatientInfoDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PatientInfoDto)
  patient: PatientInfoDto;

  @ApiProperty({ type: AppointmentDetailDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AppointmentDetailDto)
  appointment: AppointmentDetailDto;
}
