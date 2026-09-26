import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException(
        'Missing API key credentials. Pass via "Authorization: Bearer <key>" or "X-API-Key: <key>" header.',
      );
    }

    const authResult = await this.authService.validateApiKey(apiKey);
    if (!authResult) {
      throw new UnauthorizedException('Invalid, inactive or expired API key');
    }

    // Attach tenant context to the request for controller access
    (request as any).tenant = authResult.tenant;
    (request as any).apiKeyId = authResult.apiKeyId;

    return true;
  }

  private extractApiKey(request: Request): string | null {
    // 1. Authorization header: "Bearer <key>"
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 2. Custom header: "X-API-Key: <key>"
    const xApiKey = request.headers['x-api-key'];
    if (typeof xApiKey === 'string' && xApiKey.trim().length > 0) {
      return xApiKey.trim();
    }

    return null;
  }
}
