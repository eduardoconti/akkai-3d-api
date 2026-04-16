import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ApiAccessBearerAuth(): MethodDecorator & ClassDecorator {
  return applyDecorators(ApiBearerAuth('JWT'));
}
