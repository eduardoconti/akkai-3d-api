import { applyDecorators } from '@nestjs/common';
import { ApiAccessBearerAuth } from './api-cookie-auth.decorator';
import { ApiTags } from '@nestjs/swagger';

export function ApiProtectedController(tag: string): ClassDecorator {
  return applyDecorators(ApiTags(tag), ApiAccessBearerAuth()) as ClassDecorator;
}

export function ApiPublicController(tag: string): ClassDecorator {
  return applyDecorators(ApiTags(tag)) as ClassDecorator;
}
