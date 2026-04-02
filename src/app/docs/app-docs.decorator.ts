import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiAppHealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Mensagem simples de verificação da aplicação.',
      description:
        'Endpoint básico para confirmar que a aplicação NestJS está em execução.',
    }),
    ApiOkResponse({
      description: 'Aplicação respondendo normalmente.',
      schema: {
        example: 'Hello World!',
      },
    }),
  );
}
