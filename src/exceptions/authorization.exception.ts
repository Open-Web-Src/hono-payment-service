import { BaseException } from './base.exception'
import { CONSTANTS } from '~/types'

export class AuthorizationException extends BaseException {
  constructor(message = 'Authorization required', context?: Record<string, any>) {
    super(401, CONSTANTS.EXCEPTION_PREFIXES.UNAUTHORIZED, message, context)
  }
}
