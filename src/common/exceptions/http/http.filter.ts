/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Response } from 'src/common/response/response.interface';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    let status = 500;
    let message = 'Internal Server Error';
    let errors: string[] | string = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errors = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, any>;

        message = res.error || exception.message;

        if (Array.isArray(res.message)) {
          errors = res.message;
        } else {
          errors = res.message || res;
        }
      }
    }

    const errorResponse: Response<null> = {
      isSuccess: false,
      statusCode: status,
      message: message,
      error: errors,
    };

    response.status(status).json(errorResponse);
  }
}
