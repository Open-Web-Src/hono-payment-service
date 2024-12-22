import { BaseException } from './base.exception'
import { CONSTANTS } from '~/types'

export class ForbiddenException extends BaseException {
  constructor(message = 'Access to this resource is forbidden', context?: Record<string, any>) {
    super(403, CONSTANTS.EXCEPTION_PREFIXES.FORBIDDEN, message, context)
  }
}
