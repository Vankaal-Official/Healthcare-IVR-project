import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PhiMasker } from '../logging/phi-masker';

@Injectable()
export class PhiMaskingLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const sanitizedBody = req.body ? PhiMasker.sanitize(req.body) : {};
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          const sanitizedResponse = data ? PhiMasker.sanitize(data) : {};

          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${duration}ms | IP: ${ip} | UA: ${userAgent} | Payload: ${JSON.stringify(
              sanitizedBody,
            )} | Response: ${JSON.stringify(sanitizedResponse)}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const status = err.status || 500;
          this.logger.error(
            `[${method}] ${originalUrl} ${status} - ${duration}ms | IP: ${ip} | Error: ${err.message} | Payload: ${JSON.stringify(
              sanitizedBody,
            )}`,
          );
        },
      }),
    );
  }
}
