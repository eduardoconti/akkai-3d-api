import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AlterarFeiraDto,
  AlterarVendaDto,
  InserirFeiraDto,
  InserirVendaDto,
} from '@venda/dto';
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
  percentualTaxa: 2.99,
  valorTaxa: 66,
  percentualImposto: 4,
  valorImposto: 88,
  valorLiquido: 2046,
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

export function ApiListarFeirasPaginadasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista feiras com paginação.',
      description:
        'Retorna as feiras paginadas para a tela administrativa, com pesquisa opcional por nome, local ou descrição.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiOkResponse({
      description: 'Feiras encontradas com sucesso.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 1,
          totalPaginas: 1,
          itens: [FEIRA_EXEMPLO],
        },
      },
    }),
    ApiValidationErrorResponse('/venda/feiras/paginado'),
    ApiUnauthorizedErrorResponse('/venda/feiras/paginado'),
  );
}

export function ApiObterFeiraPorIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém uma feira por id.',
      description: 'Retorna os dados completos da feira para edição.',
    }),
    ApiOkResponse({
      description: 'Feira encontrada com sucesso.',
      schema: { example: FEIRA_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/venda/feiras/1'),
  );
}

export function ApiAlterarFeiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera uma feira existente.',
      description: 'Atualiza os dados cadastrais de uma feira.',
    }),
    ApiBody({
      type: AlterarFeiraDto,
      examples: {
        padrao: {
          summary: 'Feira alterada',
          value: {
            nome: 'MAUA',
            local: 'Praça Mauá',
            descricao: 'Feira fixa de domingo',
            ativa: true,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Feira alterada com sucesso.',
      schema: { example: FEIRA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/venda/feiras/1'),
    ApiUnauthorizedErrorResponse('/venda/feiras/1'),
    ApiConflictErrorResponse(
      '/venda/feiras/1',
      'Já existe uma feira cadastrada com este nome.',
    ),
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
    ApiQuery({
      name: 'idFeira',
      required: false,
      type: Number,
      example: 1,
      description:
        'Filtro opcional pela feira. Só pode ser usado quando o tipo for FEIRA.',
    }),
    ApiQuery({
      name: 'idCarteira',
      required: false,
      type: Number,
      example: 1,
      description: 'Filtro opcional pela carteira da venda.',
    }),
    ApiQuery({
      name: 'meioPagamento',
      required: false,
      enum: ['DIN', 'DEB', 'CRE', 'PIX'],
      description: 'Filtro opcional pelo meio de pagamento.',
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
          totalizadores: {
            valorTotal: 2200,
            descontoTotal: 0,
            valorLiquido: 2046,
          },
        },
      },
    }),
    ApiValidationErrorResponse('/venda'),
    ApiUnauthorizedErrorResponse('/venda'),
  );
}

export function ApiExcluirFeiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma feira.',
      description: 'Remove permanentemente uma feira pelo seu identificador.',
    }),
    ApiIdParamDocs('Identificador da feira a ser excluída.'),
    ApiNoContentResponse({ description: 'Feira excluída com sucesso.' }),
    ApiUnauthorizedErrorResponse('/venda/feiras/1'),
    ApiNotFoundErrorResponse('/venda/feiras/999', 'Feira não encontrada.'),
  );
}

export function ApiAlterarVendaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera uma venda existente.',
      description:
        'Permite atualizar dados de uma venda, incluindo tipo, meio de pagamento, carteira, feira, desconto e itens.',
    }),
    ApiIdParamDocs('Identificador da venda a ser alterada.'),
    ApiBody({
      type: AlterarVendaDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            tipo: 'FEIRA',
            meioPagamento: 'DIN',
            idCarteira: 1,
            idFeira: 1,
            desconto: 100,
            itens: [{ idProduto: 1, quantidade: 1 }],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Venda alterada com sucesso.',
      schema: { example: VENDA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/venda/1'),
    ApiUnauthorizedErrorResponse('/venda/1'),
    ApiNotFoundErrorResponse('/venda/999', 'Venda não encontrada.'),
  );
}

export function ApiExcluirVendaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma venda.',
      description: 'Remove permanentemente uma venda pelo seu identificador.',
    }),
    ApiIdParamDocs('Identificador da venda a ser excluída.'),
    ApiNoContentResponse({ description: 'Venda excluída com sucesso.' }),
    ApiUnauthorizedErrorResponse('/venda/1'),
    ApiNotFoundErrorResponse('/venda/999', 'Venda não encontrada.'),
  );
}
