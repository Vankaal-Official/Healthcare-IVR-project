import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreatePracticeDto, CreateTenantDto } from './dto/create-tenant.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentTenant, TenantId } from '../../common/decorators/tenant.decorator';
import { Tenant } from '@prisma/client';

@ApiTags('Tenants & Practices')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Register a new tenant organization (Bootstrap / Admin)' })
  @ApiResponse({ status: 201, description: 'Tenant created with live API key' })
  async createTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(dto);
  }

  @Public()
  @Get('telemetry')
  @ApiOperation({ summary: 'Live operational and financial telemetry for Van-Kaal suite' })
  async getTelemetry() {
    return this.tenantsService.getVanKaalTelemetry();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated tenant profile' })
  async getCurrentTenant(@CurrentTenant() tenant: Tenant) {
    return this.tenantsService.findTenantById(tenant.id);
  }

  @Post('practices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new practice clinic under the current tenant' })
  async createPractice(
    @TenantId() tenantId: string,
    @Body() dto: CreatePracticeDto,
  ) {
    return this.tenantsService.createPractice(tenantId, dto);
  }

  @Get('practices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all practices under the current tenant' })
  async listPractices(@TenantId() tenantId: string) {
    return this.tenantsService.listPractices(tenantId);
  }
}
