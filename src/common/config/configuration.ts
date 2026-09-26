export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'v1',
  database: {
    url: process.env.DATABASE_URL,
  },
  security: {
    apiKeySalt: process.env.API_KEY_SALT || 'vankaal_dev_salt_32_bytes_random_hex_key!!',
    jwtSecret: process.env.JWT_SECRET || 'vankaal_super_secret_jwt_key_dev_2026',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  reminders: {
    defaultSmsLeadMinutes: parseInt(process.env.DEFAULT_SMS_LEAD_MINUTES ?? '30', 10),
    defaultVoiceLeadMinutes: parseInt(process.env.DEFAULT_VOICE_LEAD_MINUTES ?? '60', 10),
    minimumVoiceLeadMinutes: parseInt(process.env.MINIMUM_VOICE_LEAD_MINUTES ?? '5', 10),
  },
  swagger: {
    enabled: process.env.ENABLE_SWAGGER === 'true',
  },
});
