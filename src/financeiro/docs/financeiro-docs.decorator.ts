import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AlterarCarteiraDto,
  InserirCarteiraDto,
  InserirDespesaDto,
  ListarCarteiraDto,
} from '@financeiro/dto';
import {
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '../../common/docs/decorators/api-default-problem-responses.decorator';
import {
  ApiIdParamDocs,
  ApiPaginacaoQueryDocs,
} from '../../common/docs/decorators/api-query-docs.decorator';

const CARTEIRA_EXEMPLO = {
  id: 1,
  nome: 'TON-BAU',
  ativa: true,
  saldoAtual: 128500,
};

const DESPESA_EXEMPLO = {
  id: 9,
  dataLancamento: '2026-04-01T00:00:00.000Z',
  descricao: 'Compra de matéria-prima',
  valor: 4500,
  categoria: 'MATERIA_PRIMA',
  meioPagamento: 'PIX',
  observacao: 'Reposição semanal de filamento',
  idCarteira: 1,
  carteira: {
    id: 1,
    nome: 'TON-BAU',
    ativa: true,
  },
};

export function ApiInserirCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra uma nova carteira.',
      description:
        'Cria uma carteira financeira usada para registrar entradas e saídas do negócio.',
    }),
    ApiBody({
      type: InserirCarteiraDto,
      examples: {
        padrao: {
          summary: 'Carteira válida',
          value: {
            nome: 'TON-BAU',
            ativa: true,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Carteira criada com sucesso.',
      schema: { example: { id: 1, nome: 'TON-BAU', ativa: true } },
    }),
    ApiValidationErrorResponse('/financeiro/carteiras'),
    ApiUnauthorizedErrorResponse('/financeiro/carteiras'),
    ApiConflictErrorResponse(
      '/financeiro/carteiras',
      'Já existe uma carteira cadastrada com este nome.',
    ),
  );
}

export function ApiListarCarteirasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista carteiras financeiras.',
      description:
        'Retorna todas as carteiras com saldo atual calculado a partir das movimentações de vendas e despesas.',
    }),
    ApiOkResponse({
      description: 'Carteiras encontradas com sucesso.',
      schema: { example: [CARTEIRA_EXEMPLO] },
      type: ListarCarteiraDto,
      isArray: true,
    }),
    ApiUnauthorizedErrorResponse('/financeiro/carteiras'),
  );
}

export function ApiObterCarteiraPorIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém os dados de uma carteira.',
      description:
        'Retorna os dados cadastrais da carteira e o saldo atual calculado.',
    }),
    ApiIdParamDocs('Identificador da carteira a ser consultada.'),
    ApiOkResponse({
      description: 'Carteira encontrada com sucesso.',
      schema: { example: CARTEIRA_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/financeiro/carteiras/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/carteiras/999',
      'Carteira não encontrada.',
    ),
  );
}

export function ApiAlterarCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera os dados de uma carteira.',
      description:
        'Permite atualizar o nome e o status ativo/inativo de uma carteira financeira.',
    }),
    ApiIdParamDocs('Identificador da carteira a ser alterada.'),
    ApiBody({
      type: AlterarCarteiraDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            nome: 'TON-BAU PRINCIPAL',
            ativa: true,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Carteira alterada com sucesso.',
      schema: {
        example: {
          id: 1,
          nome: 'TON-BAU PRINCIPAL',
          ativa: true,
        },
      },
    }),
    ApiValidationErrorResponse('/financeiro/carteiras/1'),
    ApiUnauthorizedErrorResponse('/financeiro/carteiras/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/carteiras/999',
      'Carteira não encontrada.',
    ),
    ApiConflictErrorResponse(
      '/financeiro/carteiras/1',
      'Já existe uma carteira cadastrada com este nome.',
    ),
  );
}

export function ApiInserirDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra uma nova despesa.',
      description:
        'Cria uma saída financeira vinculada a uma carteira, categoria e meio de pagamento.',
    }),
    ApiBody({
      type: InserirDespesaDto,
      examples: {
        padrao: {
          summary: 'Despesa válida',
          value: {
            dataLancamento: '2026-04-01',
            descricao: 'Compra de matéria-prima',
            valor: 4500,
            categoria: 'MATERIA_PRIMA',
            meioPagamento: 'PIX',
            idCarteira: 1,
            observacao: 'Reposição semanal de filamento',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Despesa criada com sucesso.',
      schema: { example: DESPESA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/financeiro/despesas'),
    ApiUnauthorizedErrorResponse('/financeiro/despesas'),
    ApiNotFoundErrorResponse(
      '/financeiro/despesas',
      'Carteira não encontrada.',
    ),
  );
}

export function ApiListarDespesasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista despesas com paginação.',
      description:
        'Retorna despesas paginadas com filtros opcionais por termo e intervalo de datas.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiQuery({
      name: 'dataInicio',
      required: false,
      type: String,
      example: '2026-04-01',
      description: 'Data inicial do filtro, no formato YYYY-MM-DD.',
    }),
    ApiQuery({
      name: 'dataFim',
      required: false,
      type: String,
      example: '2026-04-30',
      description: 'Data final do filtro, no formato YYYY-MM-DD.',
    }),
    ApiOkResponse({
      description: 'Despesas encontradas com sucesso.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [DESPESA_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/financeiro/despesas'),
    ApiUnauthorizedErrorResponse('/financeiro/despesas'),
  );
}
