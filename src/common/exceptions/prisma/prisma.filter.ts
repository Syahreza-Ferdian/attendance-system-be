import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'src/common/response/response.interface';
import { Response as ExpressResponse } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    const { statusCode, message } = this.resolveError(exception);

    message.replace(/\n/g, '');

    this.logger.debug(`Prisma meta: ${JSON.stringify(exception.meta)}`);

    this.logger.error(`Prisma error ${exception.code}: ${message}`);

    const errorResponse: Response<null> = {
      isSuccess: false,
      statusCode: statusCode,
      message: message,
    };

    response.status(statusCode).json(errorResponse);
  }

  private resolveError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    const cause = exception.meta?.driverAdapterError as
      | {
          cause?: {
            kind?: string;
            constraint?: {
              fields?: string[];
              index?: string;
            };
          };
        }
      | undefined;

    const constraint = cause?.cause?.constraint;

    switch (exception.code) {
      case 'P2001':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The record you are looking for does not exist',
        };
      case 'P2018':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Required related record was not found',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: (exception.meta?.cause as string) ?? 'Record not found',
        };

      case 'P2002': {
        const indexName = constraint?.index ?? '';
        const field = indexName.replace(/^[^_]+_/, '').replace(/_key$/, '');
        return {
          statusCode: HttpStatus.CONFLICT,
          message: field
            ? `${field} already in use`
            : 'A unique constraint violation occurred',
        };
      }

      case 'P2003': {
        const fields = constraint?.fields?.join(', ');
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: fields
            ? `Invalid id provided for field: ${fields}`
            : 'Foreign key constraint failed',
        };
      }

      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The change would violate a required relation',
        };

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected database error occurred',
        };
    }
  }
}
