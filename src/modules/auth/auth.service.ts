import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly salt: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.salt = this.configService.get<string>('security.apiKeySalt', 'vankaal_healthcare_secret_salt_2026');
  }

  /**
   * Hashes an API key deterministically with SHA-256 and secret salt
   */
  hashApiKey(rawKey: string): string {
    return crypto
      .createHmac('sha256', this.salt)
      .update(rawKey)
      .digest('hex');
  }

  /**
   * Generates a new cryptographically secure API key for a tenant
   */
  async generateApiKey(tenantId: string, name: string = 'Primary Integration Key') {
    const randomHex = crypto.randomBytes(24).toString('hex');
    const rawKey = `vk_live_${randomHex}`;
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = this.hashApiKey(rawKey);

    const record = await this.prisma.apiKey.create({
      data: {
        tenantId,
        name,
        keyPrefix,
        keyHash,
        isActive: true,
      },
    });

    return {
      apiKey: rawKey,
      keyId: record.id,
      keyPrefix,
      name,
      createdAt: record.createdAt,
    };
  }

  /**
   * Validates a raw API key against the database
   */
  async validateApiKey(rawKey: string): Promise<{ tenant: Tenant; apiKeyId: string } | null> {
    if (!rawKey || typeof rawKey !== 'string') return null;

    const keyHash = this.hashApiKey(rawKey.trim());
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { tenant: true },
    });

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    if (apiKey.tenant.status !== 'ACTIVE') {
      return null;
    }

    // Asynchronously record lastUsedAt without blocking request
    this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => this.logger.warn(`Could not update lastUsedAt: ${err.message}`));

    return {
      tenant: apiKey.tenant,
      apiKeyId: apiKey.id,
    };
  }
}
