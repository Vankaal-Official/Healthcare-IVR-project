import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { PhiMasker } from './phi-masker';

@Injectable({ scope: Scope.TRANSIENT })
export class PhiLoggerService extends ConsoleLogger {
  log(message: any, ...optionalParams: any[]) {
    super.log(this.maskMessage(message), ...this.maskParams(optionalParams));
  }

  error(message: any, stack?: string, context?: string) {
    super.error(this.maskMessage(message), stack, context);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(this.maskMessage(message), ...this.maskParams(optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(this.maskMessage(message), ...this.maskParams(optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(this.maskMessage(message), ...this.maskParams(optionalParams));
  }

  private maskMessage(message: any): any {
    if (typeof message === 'object') {
      return PhiMasker.sanitize(message);
    }
    return message;
  }

  private maskParams(params: any[]): any[] {
    return params.map((param) => {
      if (typeof param === 'object') {
        return PhiMasker.sanitize(param);
      }
      return param;
    });
  }
}
