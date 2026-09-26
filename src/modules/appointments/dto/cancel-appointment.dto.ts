import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @ApiPropertyOptional({ example: 'Patient called to cancel due to emergency', description: 'Reason for cancellation' })
  @IsString()
  @IsOptional()
  reason?: string;
}
