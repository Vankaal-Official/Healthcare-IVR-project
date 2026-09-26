import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-09-29', description: 'New appointment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '16:00:00', description: 'New appointment time in 24-hour format (HH:MM:SS)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'Time must be in HH:MM:SS or HH:MM 24-hour format',
  })
  time: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'Updated timezone (defaults to original)' })
  @IsString()
  @IsOptional()
  timezone?: string;
}
