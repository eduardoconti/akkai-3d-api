import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  DefinirPermissoesUsuarioDto,
  PermissaoDisponivelDto,
  PermissoesUsuarioDto,
  UsuarioAdministravelDto,
} from '@auth/dto';
import {
  ApiForbiddenErrorResponse,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';

const BASE = '/auth/administracao';

export function ApiAdministracaoUsuariosDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista os usuários para administração de permissões.',
      description:
        'Retorna cada usuário com o papel, o total de permissões efetivas e quantos ajustes individuais possui.',
    }),
    ApiOkResponse({ type: UsuarioAdministravelDto, isArray: true }),
    ApiUnauthorizedErrorResponse(`${BASE}/usuarios`),
    ApiForbiddenErrorResponse(`${BASE}/usuarios`),
  );
}

export function ApiAdministracaoPermissoesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista o catálogo de permissões do sistema.',
    }),
    ApiOkResponse({ type: PermissaoDisponivelDto, isArray: true }),
    ApiUnauthorizedErrorResponse(`${BASE}/permissoes`),
    ApiForbiddenErrorResponse(`${BASE}/permissoes`),
  );
}

export function ApiAdministracaoUsuarioPermissoesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém as permissões de um usuário.',
      description:
        'Retorna as permissões efetivas e os ajustes individuais (concedidas e revogadas) em relação ao papel.',
    }),
    ApiOkResponse({ type: PermissoesUsuarioDto }),
    ApiUnauthorizedErrorResponse(`${BASE}/usuarios/1/permissoes`),
    ApiForbiddenErrorResponse(`${BASE}/usuarios/1/permissoes`),
    ApiNotFoundErrorResponse(
      `${BASE}/usuarios/999/permissoes`,
      'Usuário com ID 999 não encontrado.',
    ),
  );
}

export function ApiDefinirPermissoesUsuarioDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Define o papel e as permissões de um usuário.',
      description:
        'Recebe o conjunto final de permissões. O servidor guarda como ajuste individual apenas o que difere do papel. Não é possível conceder permissões que o próprio administrador não possui nem remover de si mesmo a permissão de administrar permissões. A alteração vale a partir da próxima renovação da sessão do usuário.',
    }),
    ApiBody({ type: DefinirPermissoesUsuarioDto }),
    ApiOkResponse({ type: PermissoesUsuarioDto }),
    ApiValidationErrorResponse(`${BASE}/usuarios/1/permissoes`),
    ApiUnauthorizedErrorResponse(`${BASE}/usuarios/1/permissoes`),
    ApiForbiddenErrorResponse(`${BASE}/usuarios/1/permissoes`),
    ApiNotFoundErrorResponse(
      `${BASE}/usuarios/999/permissoes`,
      'Usuário com ID 999 não encontrado.',
    ),
  );
}
