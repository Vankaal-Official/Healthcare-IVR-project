export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'v1',
  database: {
    url: process.env.DATABASE_URL,
  },
  security: {
    apiKeySalt: process.env.API_KEY_SALT || 'vankaal_healthcare_secret_salt_2026',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  reminders: {
    defaultSmsLeadMinutes: parseInt(process.env.DEFAULT_SMS_LEAD_MINUTES, 10) || 60,
    defaultVoiceLeadMinutes: parseInt(process.env.DEFAULT_VOICE_LEAD_MINUTES, 10) || 30,
    minimumVoiceLeadMinutes: parseInt(process.env.MINIMUM_VOICE_LEAD_MINUTES, 10) || 5,
  },
  swagger: {
    enabled: process.env.ENABLE_SWAGGER !== 'false',
  },
});
