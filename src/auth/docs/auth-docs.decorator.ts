import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  AlterarCadastroDto,
  AlterarSenhaDto,
  AuthResponseDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  UsuarioAutenticadoDto,
} from '@auth/dto';
import {
  ApiConflictErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';
import { ApiProblemResponses } from '@common/docs/decorators/api-problem-responses.decorator';

export function ApiAuthLoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Realiza login e inicia a sessão do usuário.',
      description:
        'Valida login e senha e retorna o accessToken, refreshToken e os dados do usuário autenticado.',
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
      type: AuthResponseDto,
      schema: {
        example: {
          id: 1,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'admin',
          permissions: ['report.read', 'sales.read'],
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
        'Cria o usuário com papel padrão e retorna o accessToken, refreshToken e os dados do usuário autenticado.',
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
      type: AuthResponseDto,
      schema: {
        example: {
          id: 2,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'user',
          permissions: [],
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
        'Recebe o refreshToken no corpo da requisição, valida a sessão no banco e rotaciona os tokens de autenticação.',
    }),
    ApiBody({
      type: RefreshTokenDto,
      examples: {
        padrao: {
          summary: 'Refresh válido',
          value: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Sessão renovada com sucesso.',
      type: AuthResponseDto,
      schema: {
        example: {
          id: 1,
          name: 'Eduardo',
          login: 'eduardo',
          role: 'admin',
          permissions: ['report.read', 'sales.read'],
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
        'Revoga a sessão vinculada ao refreshToken informado no corpo da requisição.',
    }),
    ApiBody({
      type: LogoutDto,
      examples: {
        padrao: {
          summary: 'Logout com refresh token',
          value: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
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
        'Lê o access token do header Authorization e devolve o perfil com papel e permissões efetivas.',
    }),
    ApiOkResponse({
      description: 'Dados do usuário autenticado.',
      type: UsuarioAutenticadoDto,
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

export function ApiAuthRolesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista os papéis disponíveis.',
      description:
        'Retorna os papéis cadastrados para seleção no formulário de alteração de cadastro.',
    }),
    ApiOkResponse({
      description: 'Papéis encontrados com sucesso.',
      schema: {
        example: [
          {
            id: 1,
            name: 'user',
            description: 'Papel padrão',
          },
        ],
      },
    }),
    ApiUnauthorizedErrorResponse('/auth/roles'),
  );
}

export function ApiAuthUpdateProfileDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualiza o cadastro do usuário autenticado.',
      description:
        'Permite alterar os dados cadastrais do usuário atual. O campo updatedAt é atualizado automaticamente.',
    }),
    ApiBody({
      type: AlterarCadastroDto,
      examples: {
        padrao: {
          summary: 'Atualização válida',
          value: {
            name: 'Eduardo',
            login: 'eduardo',
            isActive: true,
            roleId: 1,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Cadastro atualizado com sucesso.',
      type: UsuarioAutenticadoDto,
    }),
    ApiValidationErrorResponse('/auth/me'),
    ApiUnauthorizedErrorResponse('/auth/me'),
    ApiConflictErrorResponse(
      '/auth/me',
      'Já existe um usuário cadastrado com este login.',
    ),
  );
}

export function ApiAuthUpdatePasswordDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualiza a senha do usuário autenticado.',
      description:
        'Valida a senha atual e persiste a nova senha com hash seguro.',
    }),
    ApiBody({
      type: AlterarSenhaDto,
      examples: {
        padrao: {
          summary: 'Troca de senha válida',
          value: {
            currentPassword: '123456',
            newPassword: '654321',
          },
        },
      },
    }),
    ApiNoContentResponse({
      description: 'Senha alterada com sucesso.',
    }),
    ApiValidationErrorResponse('/auth/me/password'),
    ApiUnauthorizedErrorResponse('/auth/me/password'),
  );
}
