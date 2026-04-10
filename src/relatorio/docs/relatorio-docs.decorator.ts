import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiForbiddenErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '../../common/docs/decorators/api-default-problem-responses.decorator';

export function ApiResumoVendasPeriodoDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o resumo de vendas por período.',
      description:
        'Retorna quantidade de itens vendidos, desconto total e valor total consolidado dentro do intervalo informado.',
    }),
    ApiQuery({
      name: 'dataInicio',
      required: false,
      type: String,
      example: '2026-04-01',
      description: 'Data inicial do período, no formato YYYY-MM-DD.',
    }),
    ApiQuery({
      name: 'dataFim',
      required: false,
      type: String,
      example: '2026-04-01',
      description: 'Data final do período, no formato YYYY-MM-DD.',
    }),
    ApiOkResponse({
      description: 'Resumo calculado com sucesso.',
      schema: {
        example: {
          dataInicio: '2026-04-01',
          dataFim: '2026-04-01',
          quantidadeItens: 12,
          descontoTotal: 1500,
          valorTotal: 25000,
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/vendas/resumo'),
    ApiUnauthorizedErrorResponse('/relatorio/vendas/resumo'),
    ApiForbiddenErrorResponse('/relatorio/vendas/resumo'),
  );
}

export function ApiProdutosMaisVendidosDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o relatório de produtos mais vendidos por período.',
      description:
        'Permite filtrar por período, tipo de venda, feira e múltiplas categorias, retornando o ranking paginado dos produtos mais vendidos.',
    }),
    ApiQuery({
      name: 'pagina',
      required: false,
      type: Number,
      example: 1,
      description: 'Página desejada da consulta.',
    }),
    ApiQuery({
      name: 'tamanhoPagina',
      required: false,
      type: Number,
      example: 10,
      description: 'Quantidade máxima de itens por página.',
    }),
    ApiQuery({
      name: 'dataInicio',
      required: false,
      type: String,
      example: '2026-04-01',
      description: 'Data inicial do período, no formato YYYY-MM-DD.',
    }),
    ApiQuery({
      name: 'dataFim',
      required: false,
      type: String,
      example: '2026-04-30',
      description: 'Data final do período, no formato YYYY-MM-DD.',
    }),
    ApiQuery({
      name: 'tipoVenda',
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
        'Filtro opcional pela feira. Use em conjunto com tipoVenda=FEIRA.',
    }),
    ApiQuery({
      name: 'idsCategorias',
      required: false,
      type: String,
      example: '2,3',
      description: 'Lista de categorias separadas por vírgula.',
    }),
    ApiOkResponse({
      description: 'Relatório calculado com sucesso.',
      schema: {
        example: {
          dataInicio: '2026-04-01',
          dataFim: '2026-04-30',
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 2,
          totalPaginas: 1,
          itens: [
            {
              idProduto: 1,
              nomeProduto: 'Cubo Infinito',
              categoria: {
                id: 2,
                nome: 'IMPRESSAO 3D',
              },
              quantidadeVendida: 8,
            },
            {
              idProduto: 2,
              nomeProduto: 'Bola Fidget',
              categoria: {
                id: 3,
                nome: 'FIDGET TOYS',
              },
              quantidadeVendida: 4,
            },
          ],
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/vendas/produtos-mais-vendidos'),
    ApiUnauthorizedErrorResponse('/relatorio/vendas/produtos-mais-vendidos'),
    ApiForbiddenErrorResponse('/relatorio/vendas/produtos-mais-vendidos'),
  );
}

export function ApiValorProdutosEstoqueDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o relatório de valor dos produtos em estoque.',
      description:
        'Retorna os produtos com saldo positivo em estoque, de forma paginada, incluindo quantidade, valor unitário, valor total por item e os totalizadores gerais do relatório. Os itens respeitam a página solicitada, mas os totalizadores consideram todo o conjunto retornado pelos filtros.',
    }),
    ApiQuery({
      name: 'pagina',
      required: false,
      type: Number,
      example: 1,
      description: 'Página desejada da consulta.',
    }),
    ApiQuery({
      name: 'tamanhoPagina',
      required: false,
      type: Number,
      example: 10,
      description: 'Quantidade máxima de itens por página.',
    }),
    ApiOkResponse({
      description: 'Relatório calculado com sucesso.',
      schema: {
        example: {
          pagina: 1,
          tamanhoPagina: 10,
          totalItens: 2,
          totalPaginas: 1,
          totalQuantidade: 15,
          totalValor: 4500,
          totalValorTotal: 35500,
          itens: [
            {
              codigo: 'CB-001',
              nome: 'Cubo Infinito',
              quantidade: 10,
              valor: 2500,
              valorTotal: 25000,
            },
            {
              codigo: 'BL-010',
              nome: 'Bola Fidget',
              quantidade: 5,
              valor: 2000,
              valorTotal: 10000,
            },
          ],
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/estoque/valor-produtos'),
    ApiUnauthorizedErrorResponse('/relatorio/estoque/valor-produtos'),
    ApiForbiddenErrorResponse('/relatorio/estoque/valor-produtos'),
  );
}
