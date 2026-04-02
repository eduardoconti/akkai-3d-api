import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';

export function ApiAccessCookieAuth(): MethodDecorator & ClassDecorator {
  return applyDecorators(ApiCookieAuth('access-token'));
}
