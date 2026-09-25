import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'v1';

  @IsString()
  DATABASE_URL: string;

  @IsString()
  API_KEY_SALT: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '*';

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsNumber()
  @IsOptional()
  DEFAULT_SMS_LEAD_MINUTES: number = 60;

  @IsNumber()
  @IsOptional()
  DEFAULT_VOICE_LEAD_MINUTES: number = 30;

  @IsNumber()
  @IsOptional()
  MINIMUM_VOICE_LEAD_MINUTES: number = 5;

  @IsOptional()
  ENABLE_SWAGGER: boolean = true;

  @IsString()
  @IsOptional()
  VAPI_API_KEY?: string;

  @IsString()
  @IsOptional()
  VAPI_PHONE_NUMBER_ID?: string;

  @IsString()
  @IsOptional()
  VAPI_ASSISTANT_ID?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
