import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  AlterarAssinanteDto,
  AlterarCicloDto,
  AlterarKitMensalDto,
  AlterarPlanoDto,
  InserirAssinanteDto,
  InserirCicloDto,
  InserirKitMensalDto,
  InserirPlanoDto,
} from '@assinatura/dto';
import {
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';
import {
  ApiIdParamDocs,
  ApiPaginacaoQueryDocs,
} from '@common/docs/decorators/api-query-docs.decorator';

const PLANO_EXEMPLO = {
  id: 1,
  nome: 'Kit Mensal Básico',
  descricao: 'Kit com 3 peças impressas em 3D',
  valor: 9900,
  ativo: true,
  dataInclusao: '2026-04-01T00:00:00.000Z',
};

const ASSINANTE_EXEMPLO = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '11987654321',
  enderecoEntrega: 'Rua das Flores, 123, São Paulo',
  status: 'ATIVO',
  idPlano: 1,
  plano: PLANO_EXEMPLO,
  dataInclusao: '2026-04-01T00:00:00.000Z',
};

const CICLO_EXEMPLO = {
  id: 1,
  idAssinante: 1,
  assinante: ASSINANTE_EXEMPLO,
  mesReferencia: 4,
  anoReferencia: 2026,
  status: 'PENDENTE',
  codigoRastreio: null,
  dataEnvio: null,
  observacao: null,
  dataInclusao: '2026-04-01T00:00:00.000Z',
  itens: [
    {
      id: 1,
      idCiclo: 1,
      nomeProduto: 'Cubo Infinito',
      quantidade: 2,
      observacao: null,
    },
  ],
};

export function ApiInserirPlanoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra um novo plano de assinatura.',
      description:
        'Cria um plano que define o kit mensal oferecido aos assinantes.',
    }),
    ApiBody({
      type: InserirPlanoDto,
      examples: {
        padrao: {
          summary: 'Plano básico',
          value: {
            nome: 'Kit Mensal Básico',
            descricao: 'Kit com 3 peças',
            valor: 9900,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Plano criado com sucesso.',
      schema: { example: PLANO_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/planos'),
    ApiUnauthorizedErrorResponse('/assinatura/planos'),
    ApiConflictErrorResponse(
      '/assinatura/planos',
      'Já existe um plano cadastrado com este nome.',
    ),
  );
}

export function ApiListarPlanosDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista todos os planos de assinatura.' }),
    ApiOkResponse({
      description: 'Planos encontrados.',
      schema: { example: [PLANO_EXEMPLO] },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/planos'),
  );
}

export function ApiPesquisarPlanosDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista planos com paginação.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Planos paginados.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [PLANO_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/assinatura/planos/paginado'),
    ApiUnauthorizedErrorResponse('/assinatura/planos/paginado'),
  );
}

export function ApiObterPlanoPorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém um plano pelo id.' }),
    ApiIdParamDocs('Identificador do plano.'),
    ApiOkResponse({
      description: 'Plano encontrado.',
      schema: { example: PLANO_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/planos/1'),
    ApiNotFoundErrorResponse('/assinatura/planos/999', 'Plano não encontrado.'),
  );
}

export function ApiAlterarPlanoDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Altera um plano de assinatura existente.' }),
    ApiIdParamDocs('Identificador do plano a ser alterado.'),
    ApiBody({
      type: AlterarPlanoDto,
      examples: {
        padrao: {
          summary: 'Plano atualizado',
          value: { nome: 'Kit Mensal Plus', valor: 14900, ativo: true },
        },
      },
    }),
    ApiOkResponse({
      description: 'Plano alterado com sucesso.',
      schema: { example: PLANO_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/planos/1'),
    ApiUnauthorizedErrorResponse('/assinatura/planos/1'),
    ApiNotFoundErrorResponse('/assinatura/planos/999', 'Plano não encontrado.'),
    ApiConflictErrorResponse(
      '/assinatura/planos/1',
      'Já existe um plano com este nome.',
    ),
  );
}

export function ApiExcluirPlanoDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Exclui um plano de assinatura.' }),
    ApiIdParamDocs('Identificador do plano a ser excluído.'),
    ApiNoContentResponse({ description: 'Plano excluído com sucesso.' }),
    ApiUnauthorizedErrorResponse('/assinatura/planos/1'),
    ApiNotFoundErrorResponse('/assinatura/planos/999', 'Plano não encontrado.'),
  );
}

export function ApiInserirAssinanteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cadastra um novo assinante.' }),
    ApiBody({
      type: InserirAssinanteDto,
      examples: {
        padrao: {
          summary: 'Assinante válido',
          value: {
            nome: 'João Silva',
            email: 'joao@email.com',
            telefone: '11987654321',
            idPlano: 1,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Assinante criado com sucesso.',
      schema: { example: ASSINANTE_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/assinantes'),
    ApiUnauthorizedErrorResponse('/assinatura/assinantes'),
    ApiNotFoundErrorResponse('/assinatura/assinantes', 'Plano não encontrado.'),
  );
}

export function ApiPesquisarAssinantesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista assinantes com paginação.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Assinantes encontrados.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [ASSINANTE_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/assinatura/assinantes'),
    ApiUnauthorizedErrorResponse('/assinatura/assinantes'),
  );
}

export function ApiObterAssinantePorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém um assinante pelo id.' }),
    ApiIdParamDocs('Identificador do assinante.'),
    ApiOkResponse({
      description: 'Assinante encontrado.',
      schema: { example: ASSINANTE_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/assinantes/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/assinantes/999',
      'Assinante não encontrado.',
    ),
  );
}

export function ApiAlterarAssinanteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Altera um assinante existente.' }),
    ApiIdParamDocs('Identificador do assinante a ser alterado.'),
    ApiBody({
      type: AlterarAssinanteDto,
      examples: {
        padrao: {
          summary: 'Assinante atualizado',
          value: { nome: 'João Silva', idPlano: 2, status: 'PAUSADO' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Assinante alterado com sucesso.',
      schema: { example: ASSINANTE_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/assinantes/1'),
    ApiUnauthorizedErrorResponse('/assinatura/assinantes/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/assinantes/999',
      'Assinante não encontrado.',
    ),
  );
}

export function ApiExcluirAssinanteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Exclui um assinante.' }),
    ApiIdParamDocs('Identificador do assinante a ser excluído.'),
    ApiNoContentResponse({ description: 'Assinante excluído com sucesso.' }),
    ApiUnauthorizedErrorResponse('/assinatura/assinantes/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/assinantes/999',
      'Assinante não encontrado.',
    ),
  );
}

export function ApiInserirCicloDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Registra um novo ciclo de assinatura.' }),
    ApiBody({
      type: InserirCicloDto,
      examples: {
        padrao: {
          summary: 'Ciclo de abril/2026',
          value: {
            idAssinante: 1,
            mesReferencia: 4,
            anoReferencia: 2026,
            itens: [{ nomeProduto: 'Cubo Infinito', quantidade: 2 }],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Ciclo criado com sucesso.',
      schema: { example: CICLO_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/ciclos'),
    ApiUnauthorizedErrorResponse('/assinatura/ciclos'),
    ApiNotFoundErrorResponse('/assinatura/ciclos', 'Assinante não encontrado.'),
    ApiConflictErrorResponse(
      '/assinatura/ciclos',
      'Já existe um ciclo para este assinante no mês/ano informado.',
    ),
  );
}

export function ApiPesquisarCiclosDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista ciclos de assinatura com paginação.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Ciclos encontrados.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [CICLO_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/assinatura/ciclos'),
    ApiUnauthorizedErrorResponse('/assinatura/ciclos'),
  );
}

export function ApiObterCicloPorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém um ciclo pelo id.' }),
    ApiIdParamDocs('Identificador do ciclo.'),
    ApiOkResponse({
      description: 'Ciclo encontrado.',
      schema: { example: CICLO_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/ciclos/1'),
    ApiNotFoundErrorResponse('/assinatura/ciclos/999', 'Ciclo não encontrado.'),
  );
}

export function ApiAlterarCicloDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Altera um ciclo de assinatura existente.' }),
    ApiIdParamDocs('Identificador do ciclo a ser alterado.'),
    ApiBody({
      type: AlterarCicloDto,
      examples: {
        padrao: {
          summary: 'Ciclo enviado',
          value: {
            status: 'ENVIADO',
            codigoRastreio: 'BR123456789BR',
            itens: [{ nomeProduto: 'Cubo Infinito', quantidade: 2 }],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Ciclo alterado com sucesso.',
      schema: { example: CICLO_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/ciclos/1'),
    ApiUnauthorizedErrorResponse('/assinatura/ciclos/1'),
    ApiNotFoundErrorResponse('/assinatura/ciclos/999', 'Ciclo não encontrado.'),
  );
}

export function ApiExcluirCicloDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Exclui um ciclo de assinatura.' }),
    ApiIdParamDocs('Identificador do ciclo a ser excluído.'),
    ApiNoContentResponse({ description: 'Ciclo excluído com sucesso.' }),
    ApiUnauthorizedErrorResponse('/assinatura/ciclos/1'),
    ApiNotFoundErrorResponse('/assinatura/ciclos/999', 'Ciclo não encontrado.'),
  );
}

const KIT_EXEMPLO = {
  id: 1,
  idPlano: 1,
  plano: {
    id: 1,
    nome: 'Kit Mensal Básico',
    valor: 9900,
    ativo: true,
    dataInclusao: '2026-04-01T00:00:00.000Z',
  },
  mesReferencia: 4,
  anoReferencia: 2026,
  dataInclusao: '2026-04-01T00:00:00.000Z',
  itens: [
    {
      id: 1,
      idKit: 1,
      nomeProduto: 'Cubo Infinito',
      quantidade: 2,
      observacao: null,
    },
  ],
};

export function ApiInserirKitMensalDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cadastra um novo kit mensal para um plano.' }),
    ApiBody({
      type: InserirKitMensalDto,
      examples: {
        padrao: {
          summary: 'Kit de abril/2026',
          value: {
            idPlano: 1,
            mesReferencia: 4,
            anoReferencia: 2026,
            itens: [{ nomeProduto: 'Cubo Infinito', quantidade: 2 }],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Kit mensal criado com sucesso.',
      schema: { example: KIT_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/kits'),
    ApiUnauthorizedErrorResponse('/assinatura/kits'),
    ApiNotFoundErrorResponse('/assinatura/kits', 'Plano não encontrado.'),
    ApiConflictErrorResponse(
      '/assinatura/kits',
      'Já existe um kit mensal para o plano no mês/ano informado.',
    ),
  );
}

export function ApiPesquisarKitsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista kits mensais com paginação.' }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Kits mensais encontrados.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [KIT_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/assinatura/kits'),
    ApiUnauthorizedErrorResponse('/assinatura/kits'),
  );
}

export function ApiObterKitMensalPorIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtém um kit mensal pelo id.' }),
    ApiIdParamDocs('Identificador do kit mensal.'),
    ApiOkResponse({
      description: 'Kit mensal encontrado.',
      schema: { example: KIT_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/kits/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/kits/999',
      'Kit mensal não encontrado.',
    ),
  );
}

export function ApiAlterarKitMensalDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Atualiza os itens de um kit mensal.' }),
    ApiIdParamDocs('Identificador do kit mensal a ser alterado.'),
    ApiBody({
      type: AlterarKitMensalDto,
      examples: {
        padrao: {
          summary: 'Kit atualizado',
          value: {
            itens: [{ nomeProduto: 'Dragão Miniatura', quantidade: 1 }],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Kit mensal alterado com sucesso.',
      schema: { example: KIT_EXEMPLO },
    }),
    ApiValidationErrorResponse('/assinatura/kits/1'),
    ApiUnauthorizedErrorResponse('/assinatura/kits/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/kits/999',
      'Kit mensal não encontrado.',
    ),
  );
}

export function ApiExcluirKitMensalDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Exclui um kit mensal.' }),
    ApiIdParamDocs('Identificador do kit mensal a ser excluído.'),
    ApiNoContentResponse({ description: 'Kit mensal excluído com sucesso.' }),
    ApiUnauthorizedErrorResponse('/assinatura/kits/1'),
    ApiNotFoundErrorResponse(
      '/assinatura/kits/999',
      'Kit mensal não encontrado.',
    ),
  );
}

export function ApiGerarCiclosMensaisDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gera ciclos para todos os assinantes ativos do plano.',
      description:
        'Cria um ciclo de assinatura para cada assinante ATIVO do plano vinculado ao kit. Assinantes que já possuem ciclo para o mês/ano são ignorados.',
    }),
    ApiIdParamDocs('Identificador do kit mensal.'),
    ApiOkResponse({
      description: 'Ciclos gerados com sucesso.',
      schema: { example: { criados: 3, ignorados: 1 } },
    }),
    ApiUnauthorizedErrorResponse('/assinatura/kits/1/gerar-ciclos'),
    ApiNotFoundErrorResponse(
      '/assinatura/kits/999/gerar-ciclos',
      'Kit mensal não encontrado.',
    ),
  );
}
