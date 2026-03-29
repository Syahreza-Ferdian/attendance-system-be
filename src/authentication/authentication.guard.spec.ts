import { Reflector } from '@nestjs/core';
import { AuthenticationGuard } from './authentication.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    expect(
      new AuthenticationGuard(new JwtService(), new Reflector()),
    ).toBeDefined();
  });
});
