import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { IS_ADMIN_KEY } from './authorization.decorator';
import { Request } from 'express';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdmin) {
      return Promise.resolve(true);
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (!request['user']) {
      throw new UnauthorizedException(
        'User information is missing in the request',
      );
    }

    const { user } = await this.userService.findUserDynamic(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userId: request['user'].sub,
      },
      true,
      ['withRole'],
    );

    if (!user) {
      throw new UnauthorizedException(
        'Token does not correspond to a valid user',
      );
    }

    if (!user.role.name || user.role.name !== 'HR') {
      throw new UnauthorizedException(
        'You do not have permission to access this endpoint',
      );
    }

    return true;
  }
}
