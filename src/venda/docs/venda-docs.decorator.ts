import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { InserirFeiraDto, InserirVendaDto } from '@venda/dto';
import {
  ApiConflictErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '../../common/docs/decorators/api-default-problem-responses.decorator';
import { ApiPaginacaoQueryDocs } from '../../common/docs/decorators/api-query-docs.decorator';

const FEIRA_EXEMPLO = {
  id: 1,
  nome: 'MAUA',
  local: 'Praça Mauá',
  descricao: 'Feira fixa de domingo',
  ativa: true,
};

const VENDA_EXEMPLO = {
  id: 27,
  dataInclusao: '2026-04-01T22:58:00.000Z',
  valorTotal: 2200,
  tipo: 'FEIRA',
  meioPagamento: 'PIX',
  desconto: 0,
  idCarteira: 1,
  carteira: {
    id: 1,
    nome: 'TON-BAU',
    ativa: true,
  },
  idFeira: 1,
  feira: FEIRA_EXEMPLO,
  itens: [
    {
      id: 101,
      idVenda: 27,
      idProduto: 1,
      nomeProduto: 'Cubo Infinito',
      quantidade: 1,
      valorUnitario: 2200,
      valorTotal: 2200,
    },
  ],
};

export function ApiInserirFeiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra uma nova feira.',
      description:
        'Cria uma feira para vincular vendas presenciais e relatórios por local/evento.',
    }),
    ApiBody({
      type: InserirFeiraDto,
      examples: {
        padrao: {
          summary: 'Feira válida',
          value: {
            nome: 'MAUA',
            local: 'Praça Mauá',
            descricao: 'Feira fixa de domingo',
            ativa: true,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Feira criada com sucesso.',
      schema: { example: FEIRA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/venda/feiras'),
    ApiUnauthorizedErrorResponse('/venda/feiras'),
    ApiConflictErrorResponse(
      '/venda/feiras',
      'Já existe uma feira cadastrada com este nome.',
    ),
  );
}

export function ApiInserirVendaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra uma nova venda.',
      description:
        'Cria uma venda com itens de catálogo ou itens avulsos, associando carteira financeira e feira quando aplicável.',
    }),
    ApiBody({
      type: InserirVendaDto,
      examples: {
        catalogo: {
          summary: 'Venda com item de catálogo',
          value: {
            tipo: 'FEIRA',
            meioPagamento: 'PIX',
            idCarteira: 1,
            idFeira: 1,
            desconto: 0,
            itens: [
              {
                idProduto: 1,
                quantidade: 1,
              },
            ],
          },
        },
        avulso: {
          summary: 'Venda com item avulso',
          value: {
            tipo: 'LOJA',
            meioPagamento: 'DIN',
            idCarteira: 1,
            itens: [
              {
                nomeProduto: 'Peça personalizada',
                valorUnitario: 4500,
                quantidade: 1,
              },
            ],
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Venda registrada com sucesso.',
      schema: { example: VENDA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/venda'),
    ApiUnauthorizedErrorResponse('/venda'),
    ApiConflictErrorResponse(
      '/venda',
      'Já existe um item desta venda vinculado ao mesmo produto.',
    ),
  );
}

export function ApiListarFeirasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista feiras cadastradas.',
      description:
        'Retorna as feiras disponíveis para seleção no registro de vendas e nos relatórios.',
    }),
    ApiOkResponse({
      description: 'Feiras encontradas com sucesso.',
      schema: { example: [FEIRA_EXEMPLO] },
    }),
    ApiUnauthorizedErrorResponse('/venda/feiras'),
  );
}

export function ApiListarVendasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista vendas com paginação.',
      description:
        'Retorna vendas paginadas com itens, carteira, feira e filtros opcionais por termo e tipo.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiQuery({
      name: 'tipo',
      required: false,
      enum: ['FEIRA', 'LOJA', 'ONLINE'],
      description: 'Filtro opcional pelo tipo da venda.',
    }),
    ApiOkResponse({
      description: 'Vendas encontradas com sucesso.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [VENDA_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/venda'),
    ApiUnauthorizedErrorResponse('/venda'),
  );
}
