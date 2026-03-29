import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new ResponseInterceptor(new Reflector())).toBeDefined();
  });
});
