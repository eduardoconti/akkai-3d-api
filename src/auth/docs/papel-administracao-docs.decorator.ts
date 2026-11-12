import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PapelComPermissoesDto, SalvarPapelDto } from '@auth/dto';
import {
  ApiConflictErrorResponse,
  ApiForbiddenErrorResponse,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';

const BASE = '/auth/administracao/papeis';

export function ApiAdministracaoPapeisDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista os papéis com as permissões de cada um.',
      description:
        'Inclui quantos usuários usam o papel e se ele é protegido (papéis do sistema).',
    }),
    ApiOkResponse({ type: PapelComPermissoesDto, isArray: true }),
    ApiUnauthorizedErrorResponse(BASE),
    ApiForbiddenErrorResponse(BASE),
  );
}

export function ApiCriarPapelDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cria um papel.',
      description:
        'Só é possível incluir permissões que o próprio administrador possui.',
    }),
    ApiBody({ type: SalvarPapelDto }),
    ApiOkResponse({ type: PapelComPermissoesDto }),
    ApiValidationErrorResponse(BASE),
    ApiUnauthorizedErrorResponse(BASE),
    ApiForbiddenErrorResponse(BASE),
    ApiConflictErrorResponse(BASE, 'Já existe um papel chamado "vendedor".'),
  );
}

export function ApiAtualizarPapelDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera nome, descrição e permissões de um papel.',
      description:
        'Recebe o conjunto final de permissões. Papéis do sistema não podem ser renomeados e o administrador não pode retirar do próprio papel as permissões de administração. A alteração vale para os usuários do papel na próxima renovação da sessão.',
    }),
    ApiBody({ type: SalvarPapelDto }),
    ApiOkResponse({ type: PapelComPermissoesDto }),
    ApiValidationErrorResponse(`${BASE}/1`),
    ApiUnauthorizedErrorResponse(`${BASE}/1`),
    ApiForbiddenErrorResponse(`${BASE}/1`),
    ApiNotFoundErrorResponse(`${BASE}/999`, 'Papel com ID 999 não encontrado.'),
    ApiConflictErrorResponse(
      `${BASE}/1`,
      'Já existe um papel chamado "vendedor".',
    ),
  );
}

export function ApiExcluirPapelDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui um papel.',
      description:
        'Papéis do sistema e papéis em uso por algum usuário não podem ser excluídos.',
    }),
    ApiNoContentResponse({ description: 'Papel excluído.' }),
    ApiUnauthorizedErrorResponse(`${BASE}/1`),
    ApiForbiddenErrorResponse(`${BASE}/1`),
    ApiNotFoundErrorResponse(`${BASE}/999`, 'Papel com ID 999 não encontrado.'),
    ApiConflictErrorResponse(
      `${BASE}/1`,
      'O papel "vendedor" não pode ser excluído porque 2 usuário(s) ainda o utilizam.',
    ),
  );
}
