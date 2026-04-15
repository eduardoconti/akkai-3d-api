import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  AlterarCategoriaProdutoDto,
  AlterarProdutoDto,
  EntradaEstoqueDto,
  InserirCategoriaProdutoDto,
  InserirProdutoDto,
  ListarMovimentacaoEstoqueDto,
  ListarProdutoEstoqueDto,
  ListarProdutoDto,
  SaidaEstoqueDto,
} from '@produto/dto';
import {
  ApiConflictErrorResponse,
  ApiNotFoundErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';
import { ApiPaginatedOkResponse } from '@common/docs/decorators/api-paginated-ok-response.decorator';
import {
  ApiIdParamDocs,
  ApiPaginacaoQueryDocs,
} from '@common/docs/decorators/api-query-docs.decorator';
import { ApiQuery } from '@nestjs/swagger';

const PRODUTO_EXEMPLO = {
  id: 1,
  nome: 'Cubo Infinito',
  codigo: 'FT001',
  descricao: 'Brinquedo articulado impresso em 3D.',
  idCategoria: 2,
  estoqueMinimo: 5,
  valor: 2200,
  categoria: {
    id: 2,
    nome: 'IMPRESSAO 3D',
  },
};

export function ApiInserirProdutoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra um novo produto.',
      description:
        'Cria um produto do catálogo com código único, categoria, valor em centavos e estoque mínimo opcional.',
    }),
    ApiBody({
      type: InserirProdutoDto,
      examples: {
        padrao: {
          summary: 'Produto válido',
          value: {
            nome: 'Cubo Infinito',
            codigo: 'FT001',
            descricao: 'Brinquedo articulado impresso em 3D.',
            idCategoria: 2,
            valor: 2200,
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Produto criado com sucesso.',
      schema: {
        example: {
          id: 1,
          nome: 'Cubo Infinito',
          codigo: 'FT001',
          descricao: 'Brinquedo articulado impresso em 3D.',
          idCategoria: 2,
          estoqueMinimo: null,
          valor: 2200,
        },
      },
    }),
    ApiValidationErrorResponse('/produto'),
    ApiUnauthorizedErrorResponse('/produto'),
    ApiConflictErrorResponse(
      '/produto',
      'Já existe um produto com o código informado.',
    ),
  );
}

export function ApiAlterarProdutoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera os dados cadastrais de um produto.',
      description:
        'Permite atualizar nome, código, descrição, categoria, valor e estoque mínimo do produto.',
    }),
    ApiIdParamDocs('Identificador do produto a ser alterado.'),
    ApiBody({
      type: AlterarProdutoDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            nome: 'Cubo Infinito Premium',
            codigo: 'FT001',
            descricao: 'Versão premium do cubo infinito.',
            idCategoria: 2,
            valor: 2500,
            estoqueMinimo: 4,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Produto alterado com sucesso.',
      schema: {
        example: {
          ...PRODUTO_EXEMPLO,
          nome: 'Cubo Infinito Premium',
          valor: 2500,
          estoqueMinimo: 4,
        },
      },
    }),
    ApiValidationErrorResponse('/produto/1'),
    ApiUnauthorizedErrorResponse('/produto/1'),
    ApiNotFoundErrorResponse('/produto/999', 'Produto não encontrado.'),
    ApiConflictErrorResponse(
      '/produto/1',
      'Já existe um produto com o código informado.',
    ),
  );
}

export function ApiListarProdutosDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista produtos do catálogo com paginação.',
      description:
        'Retorna produtos paginados com dados cadastrais, categoria, estoque mínimo e valor.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiQuery({
      name: 'ordenarPor',
      required: false,
      enum: ['nome', 'codigo', 'estoqueMinimo'],
      description: 'Campo usado para ordenação dos produtos.',
    }),
    ApiQuery({
      name: 'idsCategorias',
      required: false,
      type: String,
      example: '1,3,5',
      description:
        'Filtro opcional por uma ou mais categorias, separado por vírgula.',
    }),
    ApiQuery({
      name: 'direcao',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Direção da ordenação dos produtos.',
    }),
    ApiPaginatedOkResponse(
      ListarProdutoDto,
      'Produtos encontrados com sucesso.',
      {
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 2,
        totalPaginas: 1,
        itens: [
          PRODUTO_EXEMPLO,
          {
            id: 2,
            nome: 'Bola Fidget',
            codigo: 'FT002',
            descricao: 'Brinquedo sensorial.',
            idCategoria: 3,
            estoqueMinimo: 3,
            valor: 5000,
            categoria: {
              id: 3,
              nome: 'FIDGET TOYS',
            },
          },
        ],
      },
    ),
    ApiValidationErrorResponse('/produto'),
    ApiUnauthorizedErrorResponse('/produto'),
  );
}

export function ApiListarEstoqueDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista o estoque dos produtos com paginação.',
      description:
        'Retorna os produtos paginados com código, categoria, estoque mínimo e quantidade atual em estoque, sem os dados de valor.',
    }),
    ApiPaginacaoQueryDocs(),
    ApiQuery({
      name: 'ordenarPor',
      required: false,
      enum: ['nome', 'codigo', 'quantidade', 'nivelEstoque'],
      description: 'Campo usado para ordenação do estoque.',
    }),
    ApiQuery({
      name: 'direcao',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Direção da ordenação do estoque.',
    }),
    ApiPaginatedOkResponse(
      ListarProdutoEstoqueDto,
      'Estoque encontrado com sucesso.',
      {
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 2,
        totalPaginas: 1,
        itens: [
          {
            id: 1,
            nome: 'Cubo Infinito',
            codigo: 'FT001',
            descricao: 'Brinquedo articulado impresso em 3D.',
            idCategoria: 2,
            estoqueMinimo: 5,
            categoria: {
              id: 2,
              nome: 'IMPRESSAO 3D',
            },
            quantidadeEstoque: 8,
          },
          {
            id: 2,
            nome: 'Bola Fidget',
            codigo: 'FT002',
            descricao: 'Brinquedo sensorial.',
            idCategoria: 3,
            estoqueMinimo: 3,
            categoria: {
              id: 3,
              nome: 'FIDGET TOYS',
            },
            quantidadeEstoque: 16,
          },
        ],
      },
    ),
    ApiValidationErrorResponse('/produto/estoque'),
    ApiUnauthorizedErrorResponse('/produto/estoque'),
  );
}

export function ApiListarCategoriasDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista categorias de produto.',
      description:
        'Retorna as categorias cadastradas de forma paginada, com filtro opcional por nome.',
    }),
    ApiQuery({
      name: 'pagina',
      required: false,
      description: 'Página atual da pesquisa.',
      schema: { type: 'integer', default: 1, minimum: 1 },
    }),
    ApiQuery({
      name: 'tamanhoPagina',
      required: false,
      description: 'Quantidade de itens por página.',
      schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 },
    }),
    ApiQuery({
      name: 'termo',
      required: false,
      description: 'Filtro por nome da categoria.',
      schema: { type: 'string', example: 'fidget' },
    }),
    ApiOkResponse({
      description: 'Categorias encontradas com sucesso.',
      schema: {
        example: {
          itens: [
            {
              id: 2,
              nome: 'IMPRESSAO 3D',
              idAscendente: null,
            },
            {
              id: 3,
              nome: 'FIDGET TOYS',
              idAscendente: null,
            },
          ],
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 2,
          totalPaginas: 1,
        },
      },
    }),
    ApiUnauthorizedErrorResponse('/produto/categorias'),
  );
}

export function ApiInserirCategoriaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastra uma nova categoria de produto.',
      description:
        'Cria uma categoria de produto, opcionalmente vinculada a uma categoria ascendente.',
    }),
    ApiBody({
      type: InserirCategoriaProdutoDto,
      examples: {
        padrao: {
          summary: 'Categoria válida',
          value: {
            nome: 'FIDGET TOYS',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Categoria criada com sucesso.',
      schema: {
        example: {
          id: 3,
          nome: 'FIDGET TOYS',
          idAscendente: null,
          ascendente: null,
        },
      },
    }),
    ApiValidationErrorResponse('/produto/categorias'),
    ApiUnauthorizedErrorResponse('/produto/categorias'),
  );
}

export function ApiObterCategoriaPorIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o detalhe de uma categoria de produto.',
      description:
        'Retorna os dados cadastrais da categoria, incluindo a referência para a categoria ascendente quando existir.',
    }),
    ApiIdParamDocs('Identificador da categoria a ser consultada.'),
    ApiOkResponse({
      description: 'Categoria encontrada com sucesso.',
      schema: {
        example: {
          id: 3,
          nome: 'FIDGET TOYS',
          idAscendente: 1,
        },
      },
    }),
    ApiUnauthorizedErrorResponse('/produto/categorias/3'),
    ApiNotFoundErrorResponse(
      '/produto/categorias/999',
      'Categoria não encontrada.',
    ),
  );
}

export function ApiAlterarCategoriaDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Altera uma categoria de produto.',
      description:
        'Permite atualizar o nome da categoria e sua categoria ascendente opcional.',
    }),
    ApiIdParamDocs('Identificador da categoria a ser alterada.'),
    ApiBody({
      type: AlterarCategoriaProdutoDto,
      examples: {
        padrao: {
          summary: 'Alteração válida',
          value: {
            nome: 'FIDGETS PREMIUM',
            idAscendente: 1,
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Categoria alterada com sucesso.',
      schema: {
        example: {
          id: 3,
          nome: 'FIDGETS PREMIUM',
          idAscendente: 1,
        },
      },
    }),
    ApiValidationErrorResponse('/produto/categorias/3'),
    ApiUnauthorizedErrorResponse('/produto/categorias/3'),
    ApiNotFoundErrorResponse(
      '/produto/categorias/999',
      'Categoria não encontrada.',
    ),
  );
}

export function ApiObterProdutoPorIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o detalhe de um produto.',
      description:
        'Retorna os dados cadastrais do produto, categoria associada e quantidade atual em estoque.',
    }),
    ApiIdParamDocs('Identificador do produto a ser consultado.'),
    ApiOkResponse({
      description: 'Produto encontrado com sucesso.',
      schema: { example: PRODUTO_EXEMPLO },
    }),
    ApiUnauthorizedErrorResponse('/produto/1'),
    ApiNotFoundErrorResponse('/produto/999', 'Produto não encontrado.'),
  );
}

export function ApiEntradaEstoqueDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra uma entrada de estoque.',
      description:
        'Cria uma movimentação positiva de estoque para o produto informado.',
    }),
    ApiIdParamDocs(
      'Identificador do produto que receberá a entrada de estoque.',
    ),
    ApiBody({
      type: EntradaEstoqueDto,
      examples: {
        padrao: {
          summary: 'Entrada válida',
          value: {
            quantidade: 10,
            origem: 'Reposição semanal',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Entrada registrada com sucesso.',
      schema: {
        example: {
          id: 12,
          quantidade: 10,
          origem: 'Reposição semanal',
          tipo: 'ENTRADA',
          idProduto: 1,
        },
      },
    }),
    ApiValidationErrorResponse('/produto/1/estoque/entrada'),
    ApiUnauthorizedErrorResponse('/produto/1/estoque/entrada'),
    ApiNotFoundErrorResponse(
      '/produto/999/estoque/entrada',
      'Produto não encontrado.',
    ),
  );
}

export function ApiSaidaEstoqueDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra uma saída de estoque.',
      description:
        'Cria uma movimentação negativa de estoque para o produto informado.',
    }),
    ApiIdParamDocs('Identificador do produto que sofrerá a saída de estoque.'),
    ApiBody({
      type: SaidaEstoqueDto,
      examples: {
        padrao: {
          summary: 'Saída válida',
          value: {
            quantidade: 2,
            origem: 'Consumo interno',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Saída registrada com sucesso.',
      schema: {
        example: {
          id: 13,
          quantidade: 2,
          origem: 'Consumo interno',
          tipo: 'SAIDA',
          idProduto: 1,
        },
      },
    }),
    ApiValidationErrorResponse('/produto/1/estoque/saida'),
    ApiUnauthorizedErrorResponse('/produto/1/estoque/saida'),
    ApiNotFoundErrorResponse(
      '/produto/999/estoque/saida',
      'Produto não encontrado.',
    ),
  );
}

export function ApiListarMovimentacoesEstoqueDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lista o histórico de movimentações de estoque de um produto.',
      description:
        'Retorna as movimentações de estoque do produto informado em ordem decrescente de data de inclusão.',
    }),
    ApiIdParamDocs(
      'Identificador do produto para consulta do histórico de estoque.',
    ),
    ApiPaginacaoQueryDocs(),
    ApiPaginatedOkResponse(
      ListarMovimentacaoEstoqueDto,
      'Movimentações encontradas com sucesso.',
      {
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 2,
        totalPaginas: 1,
        itens: [
          {
            id: 11,
            idProduto: 1,
            quantidade: 2,
            tipo: 'S',
            origem: 'VENDA',
            dataInclusao: '2026-04-10T10:30:00.000Z',
          },
          {
            id: 10,
            idProduto: 1,
            quantidade: 5,
            tipo: 'E',
            origem: 'COMPRA',
            dataInclusao: '2026-04-09T14:00:00.000Z',
          },
        ],
      },
    ),
    ApiValidationErrorResponse('/produto/1/estoque/movimentacoes'),
    ApiUnauthorizedErrorResponse('/produto/1/estoque/movimentacoes'),
    ApiNotFoundErrorResponse(
      '/produto/999/estoque/movimentacoes',
      'Produto não encontrado.',
    ),
  );
}
