import { BaseException } from './base.exception'
import { CONSTANTS } from '~/types'

export class NotFoundException extends BaseException {
  constructor(message = 'The requested resource was not found', context?: Record<string, any>) {
    super(404, CONSTANTS.EXCEPTION_PREFIXES.NOT_FOUND, message, context)
  }
}
