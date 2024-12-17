import { BaseException } from './base.exception';
import { CONSTANTS } from '~/types';

export class BadRequestException extends BaseException {
  constructor(message = 'Invalid request', context?: Record<string, any>) {
    super(400, CONSTANTS.EXCEPTION_PREFIXES.BAD_REQUEST, message, context);
  }
}
