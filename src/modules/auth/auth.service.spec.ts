import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService (API Key Authentication)', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            apiKey: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal: any) => defaultVal,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should deterministically hash API keys with HMAC-SHA256', () => {
    const rawKey = 'vk_live_1234567890abcdef1234567890abcdef';
    const hash1 = service.hashApiKey(rawKey);
    const hash2 = service.hashApiKey(rawKey);

    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 hex string
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different API keys', () => {
    const hash1 = service.hashApiKey('vk_live_key_1');
    const hash2 = service.hashApiKey('vk_live_key_2');

    expect(hash1).not.toBe(hash2);
  });
});
