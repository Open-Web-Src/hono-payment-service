import { BaseException } from './base.exception';
import { CONSTANTS } from '~/types';

export class RateLimitException extends BaseException {
  constructor(message = 'Rate limit exceeded', context?: Record<string, any>) {
    super(429, CONSTANTS.EXCEPTION_PREFIXES.RATE_LIMIT, message, context);
  }
}
