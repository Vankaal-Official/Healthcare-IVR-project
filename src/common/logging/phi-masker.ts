/**
 * HIPAA PHI Sanitization Utility
 * Redacts Protected Health Information (ePHI) from logs and diagnostic traces.
 */
export class PhiMasker {
  private static readonly SENSITIVE_KEYS = new Set([
    'phone',
    'patientphone',
    'patient_phone',
    'patient',
    'patientname',
    'patient_name',
    'name',
    'authorization',
    'apikey',
    'api_key',
    'keyhash',
    'key_hash',
    'secret',
    'token',
    'ssn',
    'dob',
    'dateofbirth',
  ]);

  /**
   * Masks a phone number: +14155551234 -> +1415***1234
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return '***-****';
    const clean = phone.trim();
    const prefix = clean.slice(0, Math.min(5, Math.floor(clean.length / 2)));
    const suffix = clean.slice(-4);
    return `${prefix}***${suffix}`;
  }

  /**
   * Masks a human name: "John Doe" -> "J*** D**"
   */
  static maskName(name: string): string {
    if (!name || name.trim().length === 0) return '***';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => (part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : '*'))
      .join(' ');
  }

  /**
   * Masks an authorization header / secret: "Bearer vk_live_123456789" -> "Bearer vk_live_***"
   */
  static maskSecret(secret: string): string {
    if (!secret) return '***';
    if (secret.startsWith('Bearer ')) {
      const token = secret.substring(7);
      return `Bearer ${token.substring(0, 8)}...***`;
    }
    return secret.length > 8 ? `${secret.substring(0, 4)}...***` : '***';
  }

  /**
   * Recursively sanitizes any payload object or array
   */
  static sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      // Check if it looks like a phone number
      if (/^\+?[1-9]\d{7,14}$/.test(obj.replace(/[\s()-]/g, ''))) {
        return this.maskPhone(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');

        if (normalizedKey.includes('phone')) {
          sanitized[key] = typeof value === 'string' ? this.maskPhone(value) : '***-****';
        } else if (normalizedKey.includes('name') && normalizedKey !== 'appname' && normalizedKey !== 'keyname') {
          sanitized[key] = typeof value === 'string' ? this.maskName(value) : '***';
        } else if (
          normalizedKey.includes('auth') ||
          normalizedKey.includes('token') ||
          normalizedKey.includes('secret') ||
          normalizedKey.includes('key') && !normalizedKey.includes('id')
        ) {
          sanitized[key] = typeof value === 'string' ? this.maskSecret(value) : '***';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }

    return obj;
  }
}
