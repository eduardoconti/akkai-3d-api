import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedErrorResponse } from '@common/docs/decorators/api-default-problem-responses.decorator';
import { ListaAlertasDto } from '@notificacao/dto';

export function ApiListarAlertasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista os alertas do usuário.',
      description:
        'Calcula na hora os alertas do estado atual (orçamentos pendentes, caixas abertos há muito tempo, estoque negativo). Cada alerta só aparece para quem tem permissão de leitura do assunto.',
    }),
    ApiOkResponse({
      description: 'Alertas calculados com sucesso.',
      type: ListaAlertasDto,
    }),
    ApiUnauthorizedErrorResponse('/notificacao/alertas'),
  );
}
