import { UsersService } from 'src/users/users.service';
import { AuthorizationGuard } from './authorization.guard';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('AuthorizationGuard', () => {
  it('should be defined', () => {
    expect(
      new AuthorizationGuard(
        new UsersService(new PrismaService()),
        new Reflector(),
      ),
    ).toBeDefined();
  });
});
