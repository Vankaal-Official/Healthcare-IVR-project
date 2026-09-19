import { PrismaClient, TenantStatus, PracticeStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const salt = process.env.API_KEY_SALT || 'vankaal_healthcare_secret_salt_2026';

function hashApiKey(rawKey: string): string {
  return crypto.createHmac('sha256', salt).update(rawKey).digest('hex');
}

async function main() {
  console.log('Seeding initial Healthcare API tenant and API keys...');

  // 1. Create or update sample tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'vankaal-demo-health' },
    update: {},
    create: {
      name: 'Van-Kaal Demo Health Network',
      slug: 'vankaal-demo-health',
      status: TenantStatus.ACTIVE,
    },
  });

  console.log(`Tenant created/verified: ${tenant.name} (${tenant.id})`);

  // 2. Create sample practice
  const practice = await prisma.practice.upsert({
    where: {
      tenantId_externalPracticeId: {
        tenantId: tenant.id,
        externalPracticeId: 'practice_001',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      externalPracticeId: 'practice_001',
      name: 'Manhattan Health Center',
      timezone: 'America/New_York',
      phone: '+14155550199',
      status: PracticeStatus.ACTIVE,
    },
  });

  console.log(`Practice created/verified: ${practice.name} (practice_001)`);

  // 3. Create known test API key: vk_live_test_key_van_kaal_2026
  const rawApiKey = 'vk_live_test_key_van_kaal_2026';
  const keyHash = hashApiKey(rawApiKey);

  const apiKey = await prisma.apiKey.upsert({
    where: { keyHash },
    update: { isActive: true },
    create: {
      tenantId: tenant.id,
      name: 'Development & Testing Master Key',
      keyPrefix: rawApiKey.substring(0, 12),
      keyHash,
      isActive: true,
    },
  });

  console.log(`\n=============================================`);
  console.log(`DEMO API CREDENTIALS:`);
  console.log(`Tenant ID: ${tenant.id}`);
  console.log(`Practice ID: practice_001`);
  console.log(`API Key: ${rawApiKey}`);
  console.log(`Key ID: ${apiKey.id}`);
  console.log(`=============================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
