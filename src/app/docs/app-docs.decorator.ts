import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiAppHealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verifica a saúde da aplicação.',
      description:
        'Endpoint público e leve para confirmar que a API está em execução e pronta para responder.',
    }),
    ApiOkResponse({
      description: 'Aplicação respondendo normalmente.',
      schema: {
        example: {
          status: 'ok',
          timestamp: '2026-04-02T12:00:00.000Z',
        },
      },
    }),
  );
}
