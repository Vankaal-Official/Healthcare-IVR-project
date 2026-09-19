import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Metro Health Partners', description: 'Organization or customer name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'metro-health', description: 'Unique slug for tenant identifier' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug: string;
}

export class CreatePracticeDto {
  @ApiProperty({ example: 'practice_001', description: 'External ID in customer EHR' })
  @IsString()
  @IsNotEmpty()
  externalPracticeId: string;

  @ApiProperty({ example: 'Downtown Clinic', description: 'Practice or clinic branch name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'IANA Timezone' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: '+14155550199', description: 'Clinic contact phone' })
  @IsString()
  @IsOptional()
  phone?: string;
}
