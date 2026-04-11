import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginDto, AuthMeDto, RegisterDto } from '@auth/dto';
import {
  ApiConflictErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '../../common/docs/decorators/api-default-problem-responses.decorator';
import { ApiProblemResponses } from '../../common/docs/decorators/api-problem-responses.decorator';

export function ApiAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Realiza login e inicia a sessão do usuário.',
      description:
        'Valida login e senha, emite os cookies HttpOnly `access_token` e `refresh_token` e retorna os dados básicos do usuário autenticado.',
    }),
    ApiBody({
      type: LoginDto,
      examples: {
        padrao: {
          summary: 'Login válido',
          value: {
            login: 'eduardo',
            password: '123456',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Login realizado com sucesso.',
      type: AuthMeDto,
      schema: {
        example: {
          id: 1,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'admin',
          permissions: ['report.read', 'sales.read'],
        },
      },
    }),
    ApiValidationErrorResponse('/auth/login'),
    ApiUnauthorizedErrorResponse('/auth/login'),
  );
}

export function ApiAuthRegisterDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra um novo usuário e inicia a sessão automaticamente.',
      description:
        'Cria o usuário com papel padrão, gera os cookies HttpOnly da sessão e devolve os dados do usuário autenticado.',
    }),
    ApiBody({
      type: RegisterDto,
      examples: {
        padrao: {
          summary: 'Cadastro válido',
          value: {
            name: 'Eduardo',
            login: 'eduardo',
            password: '123456',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Usuário criado e autenticado com sucesso.',
      type: AuthMeDto,
      schema: {
        example: {
          id: 2,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'user',
          permissions: [],
        },
      },
    }),
    ApiValidationErrorResponse('/auth/register'),
    ApiConflictErrorResponse(
      '/auth/register',
      'Já existe um usuário cadastrado com este login.',
    ),
  );
}

export function ApiAuthRefreshDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Renova a sessão do usuário autenticado.',
      description:
        'Lê o cookie `refresh_token`, valida a sessão no banco e rotaciona os tokens de autenticação.',
    }),
    ApiOkResponse({
      description: 'Sessão renovada com sucesso.',
      type: AuthMeDto,
      schema: {
        example: {
          id: 1,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'admin',
          permissions: ['report.read', 'sales.read'],
        },
      },
    }),
    ApiProblemResponses({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh token ausente, expirado, inválido ou revogado.',
      example: {
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Refresh token inválido ou ausente.',
        instance: '/auth/refresh',
      },
    }),
  );
}

export function ApiAuthLogoutDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Encerra a sessão atual do usuário.',
      description:
        'Revoga a sessão vinculada ao refresh token atual e limpa os cookies de autenticação.',
    }),
    ApiNoContentResponse({
      description: 'Logout realizado com sucesso.',
    }),
    ApiUnauthorizedErrorResponse('/auth/logout'),
  );
}

export function ApiAuthMeDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Retorna os dados do usuário autenticado.',
      description:
        'Lê o access token do cookie HttpOnly e devolve o perfil com papel e permissões efetivas.',
    }),
    ApiOkResponse({
      description: 'Dados do usuário autenticado.',
      type: AuthMeDto,
      schema: {
        example: {
          id: 1,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'admin',
          permissions: ['report.read', 'sales.read'],
        },
      },
    }),
    ApiUnauthorizedErrorResponse('/auth/me'),
  );
}
