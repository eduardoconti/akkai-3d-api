import { HttpStatus } from '@nestjs/common';
import { ApiProblemResponses } from './api-problem-responses.decorator';

const VALIDATION_EXAMPLE = {
  type: 'https://httpstatuses.com/400',
  title: 'Bad Request',
  status: 400,
  detail: 'Os dados informados são inválidos.',
  instance: '/produto',
  errors: [
    {
      campo: 'nome',
      mensagens: ['O nome do produto é obrigatório.'],
    },
  ],
};

const UNAUTHORIZED_EXAMPLE = {
  type: 'https://httpstatuses.com/401',
  title: 'Unauthorized',
  status: 401,
  detail: 'Autenticação inválida ou ausente.',
  instance: '/produto',
};

const FORBIDDEN_EXAMPLE = {
  type: 'https://httpstatuses.com/403',
  title: 'Forbidden',
  status: 403,
  detail: 'Você não possui permissão para acessar este recurso.',
  instance: '/relatorio/vendas/resumo',
};

const NOT_FOUND_EXAMPLE = {
  type: 'https://httpstatuses.com/404',
  title: 'Not Found',
  status: 404,
  detail: 'Registro não encontrado.',
  instance: '/produto/999',
};

const CONFLICT_EXAMPLE = {
  type: 'https://httpstatuses.com/409',
  title: 'Conflict',
  status: 409,
  detail: 'Já existe um registro com os dados informados.',
  instance: '/produto',
};

export function ApiValidationErrorResponse(instance: string) {
  return ApiProblemResponses({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Erro de validação do payload ou dos parâmetros da requisição.',
    example: { ...VALIDATION_EXAMPLE, instance },
  });
}

export function ApiUnauthorizedErrorResponse(instance: string) {
  return ApiProblemResponses({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Sessão ausente, expirada ou inválida.',
    example: { ...UNAUTHORIZED_EXAMPLE, instance },
  });
}

export function ApiForbiddenErrorResponse(instance: string) {
  return ApiProblemResponses({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário autenticado sem permissão suficiente para o recurso.',
    example: { ...FORBIDDEN_EXAMPLE, instance },
  });
}

export function ApiNotFoundErrorResponse(instance: string, detail: string) {
  return ApiProblemResponses({
    status: HttpStatus.NOT_FOUND,
    description: 'Recurso solicitado não encontrado.',
    example: { ...NOT_FOUND_EXAMPLE, instance, detail },
  });
}

export function ApiConflictErrorResponse(instance: string, detail: string) {
  return ApiProblemResponses({
    status: HttpStatus.CONFLICT,
    description: 'Conflito de negócio ou violação de unicidade.',
    example: { ...CONFLICT_EXAMPLE, instance, detail },
  });
}
