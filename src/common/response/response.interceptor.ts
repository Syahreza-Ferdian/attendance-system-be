/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from './response.interface';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from './response.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        isSuccess: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message:
          this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
            context.getHandler(),
            context.getClass(),
          ]) || 'Success',
        data: data,
      })),
    );
  }
}
