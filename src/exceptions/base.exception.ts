import { HTTPException } from 'hono/http-exception';
import { StatusCode } from 'hono/utils/http-status';

export abstract class BaseException extends HTTPException {
  constructor(
    status: StatusCode,
    prefix: string,
    message: string,
    context?: Record<string, any>
  ) {
    const fullMessage = context
      ? `${prefix} ${message} | Context: ${JSON.stringify(context)}`
      : `${prefix} ${message}`;
    super(status, { message: fullMessage });
  }
}
