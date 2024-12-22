import { BaseException } from './base.exception'
import { CONSTANTS } from '~/types'

export class InternalServerException extends BaseException {
  constructor(message = 'An unexpected error occurred', context?: Record<string, any>) {
    super(500, CONSTANTS.EXCEPTION_PREFIXES.INTERNAL_SERVER, message, context)
  }
}
