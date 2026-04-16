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
  AlterarCarteiraDto,
  AlterarCategoriaDespesaDto,
  AlterarDespesaDto,
  AlterarTaxaMeioPagamentoCarteiraDto,
  InserirCarteiraDto,
  InserirCategoriaDespesaDto,
  InserirDespesaDto,
  InserirTaxaMeioPagamentoCarteiraDto,
  ListarCarteiraDto,
  ListarTaxaMeioPagamentoCarteiraDto,
} from '@financeiro/dto';
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

const CARTEIRA_EXEMPLO = {
  id: 1,
  nome: 'TON-BAU',
  ativa: true,
  meiosPagamento: ['PIX', 'CRE'],
  consideraImpostoVenda: true,
  percentualImpostoVenda: 4,
  saldoAtual: 128500,
};

const DESPESA_EXEMPLO = {
  id: 9,
  dataLancamento: '2026-04-01T00:00:00.000Z',
  descricao: 'Compra de matéria-prima',
  valor: 4500,
  idCategoria: 1,
  categoria: { id: 1, nome: 'Matéria-prima' },
  meioPagamento: 'PIX',
  observacao: 'Reposição semanal de filamento',
  idCarteira: 1,
  idFeira: 2,
  carteira: {
    id: 1,
    nome: 'TON-BAU',
    ativa: true,
  },
  feira: {
    id: 2,
    nome: 'Feira Central',
    ativa: true,
  },
};

const TAXA_MEIO_PAGAMENTO_CARTEIRA_EXEMPLO = {
  id: 1,
  idCarteira: 1,
  meioPagamento: 'PIX',
  percentual: 2.99,
  ativa: true,
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
            meiosPagamento: ['PIX', 'CRE'],
            consideraImpostoVenda: true,
            percentualImpostoVenda: 4,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Carteira criada com sucesso.',
      type: ListarCarteiraDto,
      schema: { example: CARTEIRA_EXEMPLO },
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
      type: ListarCarteiraDto,
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
            meiosPagamento: ['PIX', 'DEB', 'CRE'],
            consideraImpostoVenda: true,
            percentualImpostoVenda: 4,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Carteira alterada com sucesso.',
      type: ListarCarteiraDto,
      schema: {
        example: {
          id: 1,
          nome: 'TON-BAU PRINCIPAL',
          ativa: true,
          meiosPagamento: ['PIX', 'DEB', 'CRE'],
          consideraImpostoVenda: true,
          percentualImpostoVenda: 4,
          saldoAtual: 128500,
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

export function ApiInserirTaxaMeioPagamentoCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra uma nova taxa por meio de pagamento e carteira.',
      description:
        'Cria uma configuração de taxa percentual vinculada a uma carteira e um meio de pagamento.',
    }),
    ApiBody({
      type: InserirTaxaMeioPagamentoCarteiraDto,
      examples: {
        padrao: {
          summary: 'Taxa válida',
          value: {
            idCarteira: 1,
            meioPagamento: 'PIX',
            percentual: 2.99,
            ativa: true,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Taxa criada com sucesso.',
      schema: { example: TAXA_MEIO_PAGAMENTO_CARTEIRA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/financeiro/taxas-meio-pagamento-carteira'),
    ApiUnauthorizedErrorResponse('/financeiro/taxas-meio-pagamento-carteira'),
    ApiConflictErrorResponse(
      '/financeiro/taxas-meio-pagamento-carteira',
      'Já existe uma taxa cadastrada para esta carteira e meio de pagamento.',
    ),
  );
}

export function ApiListarTaxasMeioPagamentoCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista taxas por meio de pagamento e carteira.',
      description:
        'Retorna todas as taxas cadastradas com a carteira vinculada.',
    }),
    ApiOkResponse({
      description: 'Taxas encontradas com sucesso.',
      schema: { example: [TAXA_MEIO_PAGAMENTO_CARTEIRA_EXEMPLO] },
      type: ListarTaxaMeioPagamentoCarteiraDto,
      isArray: true,
    }),
    ApiUnauthorizedErrorResponse('/financeiro/taxas-meio-pagamento-carteira'),
  );
}

export function ApiObterTaxaMeioPagamentoCarteiraPorIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém os dados de uma taxa por meio de pagamento e carteira.',
      description:
        'Retorna os dados cadastrais de uma taxa específica com a carteira vinculada.',
    }),
    ApiIdParamDocs('Identificador da taxa a ser consultada.'),
    ApiOkResponse({
      description: 'Taxa encontrada com sucesso.',
      schema: { example: TAXA_MEIO_PAGAMENTO_CARTEIRA_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/financeiro/taxas-meio-pagamento-carteira/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/taxas-meio-pagamento-carteira/999',
      'Taxa por meio de pagamento e carteira com ID 999 não encontrada.',
    ),
  );
}

export function ApiAlterarTaxaMeioPagamentoCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera os dados de uma taxa por meio de pagamento e carteira.',
      description:
        'Permite atualizar a carteira, o meio de pagamento, o percentual e o status da taxa.',
    }),
    ApiIdParamDocs('Identificador da taxa a ser alterada.'),
    ApiBody({
      type: AlterarTaxaMeioPagamentoCarteiraDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            idCarteira: 1,
            meioPagamento: 'PIX',
            percentual: 3.49,
            ativa: true,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Taxa alterada com sucesso.',
      schema: {
        example: {
          ...TAXA_MEIO_PAGAMENTO_CARTEIRA_EXEMPLO,
          percentual: 3.49,
        },
      },
    }),
    ApiValidationErrorResponse('/financeiro/taxas-meio-pagamento-carteira/1'),
    ApiUnauthorizedErrorResponse('/financeiro/taxas-meio-pagamento-carteira/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/taxas-meio-pagamento-carteira/999',
      'Taxa por meio de pagamento e carteira com ID 999 não encontrada.',
    ),
    ApiConflictErrorResponse(
      '/financeiro/taxas-meio-pagamento-carteira/1',
      'Já existe uma taxa cadastrada para esta carteira e meio de pagamento.',
    ),
  );
}

export function ApiExcluirTaxaMeioPagamentoCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma taxa por meio de pagamento e carteira.',
      description:
        'Remove uma taxa específica cadastrada para uma carteira e meio de pagamento.',
    }),
    ApiIdParamDocs('Identificador da taxa a ser excluída.'),
    ApiNoContentResponse({
      description: 'Taxa excluída com sucesso.',
    }),
    ApiUnauthorizedErrorResponse('/financeiro/taxas-meio-pagamento-carteira/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/taxas-meio-pagamento-carteira/999',
      'Taxa por meio de pagamento e carteira com ID 999 não encontrada.',
    ),
  );
}

export function ApiExcluirCarteiraDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma carteira.',
      description:
        'Remove permanentemente uma carteira pelo seu identificador.',
    }),
    ApiIdParamDocs('Identificador da carteira a ser excluída.'),
    ApiNoContentResponse({ description: 'Carteira excluída com sucesso.' }),
    ApiUnauthorizedErrorResponse('/financeiro/carteiras/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/carteiras/999',
      'Carteira não encontrada.',
    ),
  );
}

export function ApiListarCategoriasDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista categorias de despesa.',
      description: 'Retorna todas as categorias de despesa cadastradas.',
    }),
    ApiOkResponse({
      description: 'Categorias encontradas com sucesso.',
      schema: {
        example: [
          { id: 1, nome: 'Matéria-prima' },
          { id: 2, nome: 'Embalagem' },
        ],
      },
    }),
    ApiUnauthorizedErrorResponse('/financeiro/categorias-despesa'),
  );
}

export function ApiInserirCategoriaDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra uma nova categoria de despesa.',
      description:
        'Cria uma categoria de despesa para classificação das saídas financeiras.',
    }),
    ApiBody({
      type: InserirCategoriaDespesaDto,
      examples: {
        padrao: {
          summary: 'Categoria válida',
          value: { nome: 'Matéria-prima' },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Categoria de despesa criada com sucesso.',
      schema: { example: { id: 3, nome: 'Matéria-prima' } },
    }),
    ApiValidationErrorResponse('/financeiro/categorias-despesa'),
    ApiUnauthorizedErrorResponse('/financeiro/categorias-despesa'),
    ApiConflictErrorResponse(
      '/financeiro/categorias-despesa',
      'Já existe uma categoria de despesa com este nome.',
    ),
  );
}

export function ApiAlterarCategoriaDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera uma categoria de despesa.',
      description: 'Permite renomear uma categoria de despesa existente.',
    }),
    ApiIdParamDocs('Identificador da categoria de despesa a ser alterada.'),
    ApiBody({
      type: AlterarCategoriaDespesaDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: { nome: 'Insumos' },
        },
      },
    }),
    ApiOkResponse({
      description: 'Categoria de despesa alterada com sucesso.',
      schema: { example: { id: 1, nome: 'Insumos' } },
    }),
    ApiValidationErrorResponse('/financeiro/categorias-despesa/1'),
    ApiUnauthorizedErrorResponse('/financeiro/categorias-despesa/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/categorias-despesa/999',
      'Categoria de despesa não encontrada.',
    ),
  );
}

export function ApiExcluirCategoriaDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma categoria de despesa.',
      description:
        'Remove permanentemente uma categoria de despesa pelo seu identificador.',
    }),
    ApiIdParamDocs('Identificador da categoria de despesa a ser excluída.'),
    ApiNoContentResponse({
      description: 'Categoria de despesa excluída com sucesso.',
    }),
    ApiUnauthorizedErrorResponse('/financeiro/categorias-despesa/1'),
    ApiNotFoundErrorResponse(
      '/financeiro/categorias-despesa/999',
      'Categoria de despesa não encontrada.',
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
            idCategoria: 1,
            meioPagamento: 'PIX',
            idCarteira: 1,
            idFeira: 2,
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

export function ApiAlterarDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera os dados de uma despesa.',
      description:
        'Atualiza todos os campos de uma despesa existente vinculada a uma carteira e categoria.',
    }),
    ApiIdParamDocs('Identificador da despesa a ser alterada.'),
    ApiBody({
      type: AlterarDespesaDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            dataLancamento: '2026-04-01',
            descricao: 'Compra de matéria-prima',
            valor: 5000,
            idCategoria: 1,
            meioPagamento: 'PIX',
            idCarteira: 1,
            idFeira: 2,
            observacao: 'Reposição quinzenal',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Despesa alterada com sucesso.',
      schema: { example: DESPESA_EXEMPLO },
    }),
    ApiValidationErrorResponse('/financeiro/despesas/9'),
    ApiUnauthorizedErrorResponse('/financeiro/despesas/9'),
    ApiNotFoundErrorResponse(
      '/financeiro/despesas/999',
      'Despesa com ID 999 não encontrada.',
    ),
  );
}

export function ApiExcluirDespesaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Exclui uma despesa.',
      description: 'Remove permanentemente uma despesa pelo seu identificador.',
    }),
    ApiIdParamDocs('Identificador da despesa a ser excluída.'),
    ApiNoContentResponse({ description: 'Despesa excluída com sucesso.' }),
    ApiUnauthorizedErrorResponse('/financeiro/despesas/9'),
    ApiNotFoundErrorResponse(
      '/financeiro/despesas/999',
      'Despesa com ID 999 não encontrada.',
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
    ApiQuery({
      name: 'idsCategorias',
      required: false,
      type: String,
      example: '1,3',
      description: 'Lista de categorias separadas por vírgula.',
    }),
    ApiQuery({
      name: 'idFeira',
      required: false,
      type: Number,
      example: 2,
      description: 'Identificador da feira vinculada à despesa.',
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
