import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePracticeDto, CreateTenantDto } from './dto/create-tenant.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Tenant with slug "${dto.slug}" already exists`);
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });

    // Auto-generate primary integration API Key
    const keyInfo = await this.authService.generateApiKey(tenant.id, 'Primary Live Key');

    return {
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
      credentials: {
        apiKey: keyInfo.apiKey,
        keyPrefix: keyInfo.keyPrefix,
        note: 'Save this API key immediately; it will not be shown in plain text again.',
      },
    };
  }

  async findTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { practices: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }
    return tenant;
  }

  async getOrCreatePractice(tenantId: string, externalPracticeId: string, fallbackName?: string, timezone: string = 'America/New_York') {
    let practice = await this.prisma.practice.findUnique({
      where: {
        tenantId_externalPracticeId: {
          tenantId,
          externalPracticeId,
        },
      },
    });

    if (!practice) {
      practice = await this.prisma.practice.create({
        data: {
          tenantId,
          externalPracticeId,
          name: fallbackName || `Practice ${externalPracticeId}`,
          timezone,
        },
      });
    }

    return practice;
  }

  async createPractice(tenantId: string, dto: CreatePracticeDto) {
    const existing = await this.prisma.practice.findUnique({
      where: {
        tenantId_externalPracticeId: {
          tenantId,
          externalPracticeId: dto.externalPracticeId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Practice "${dto.externalPracticeId}" already exists for this tenant`);
    }

    return this.prisma.practice.create({
      data: {
        tenantId,
        externalPracticeId: dto.externalPracticeId,
        name: dto.name,
        timezone: dto.timezone || 'America/New_York',
        phone: dto.phone,
      },
    });
  }

  async listPractices(tenantId: string) {
    return this.prisma.practice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
