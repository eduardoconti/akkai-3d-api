import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiForbiddenErrorResponse,
  ApiUnauthorizedErrorResponse,
  ApiValidationErrorResponse,
} from '@common/docs/decorators/api-default-problem-responses.decorator';

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

export function ApiResumoMensalDashboardDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o resumo mensal do dashboard.',
      description:
        'Retorna os valores consolidados de vendas, despesas e saldo para cada mês do ano informado.',
    }),
    ApiQuery({
      name: 'ano',
      required: false,
      type: Number,
      example: 2026,
      description: 'Ano utilizado para consolidar os totais mensais.',
    }),
    ApiOkResponse({
      description: 'Resumo mensal calculado com sucesso.',
      schema: {
        example: {
          ano: 2026,
          totalVendas: 150000,
          totalDespesas: 47000,
          saldo: 103000,
          itens: [
            {
              mes: 1,
              valorVendas: 12000,
              valorDespesas: 4500,
              saldo: 7500,
            },
            {
              mes: 2,
              valorVendas: 18000,
              valorDespesas: 5000,
              saldo: 13000,
            },
          ],
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/dashboard/resumo-mensal'),
    ApiUnauthorizedErrorResponse('/relatorio/dashboard/resumo-mensal'),
    ApiForbiddenErrorResponse('/relatorio/dashboard/resumo-mensal'),
  );
}

export function ApiTopProdutosMesDashboardDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém o top 5 produtos mais vendidos do mês atual.',
      description:
        'Retorna os cinco produtos com maior quantidade vendida no mês atual, para uso no dashboard inicial.',
    }),
    ApiOkResponse({
      description: 'Top produtos do mês calculado com sucesso.',
      schema: {
        example: {
          ano: 2026,
          mes: 4,
          itens: [
            {
              idProduto: 1,
              codigo: 'CB-001',
              nomeProduto: 'Cubo Infinito',
              categoria: { id: 2, nome: 'IMPRESSAO 3D' },
              quantidadeVendida: 18,
            },
          ],
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/dashboard/top-produtos-mes'),
    ApiUnauthorizedErrorResponse('/relatorio/dashboard/top-produtos-mes'),
    ApiForbiddenErrorResponse('/relatorio/dashboard/top-produtos-mes'),
  );
}

export function ApiDespesasCategoriasMesDashboardDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtém as despesas do mês por categoria para o dashboard.',
      description:
        'Retorna as categorias com maior valor de despesa no mês atual, para uso no dashboard inicial.',
    }),
    ApiOkResponse({
      description: 'Despesas do mês por categoria calculadas com sucesso.',
      schema: {
        example: {
          ano: 2026,
          mes: 4,
          itens: [
            {
              idCategoria: 1,
              nomeCategoria: 'Insumos',
              valorTotal: 12500,
            },
          ],
        },
      },
    }),
    ApiValidationErrorResponse('/relatorio/dashboard/despesas-categorias-mes'),
    ApiUnauthorizedErrorResponse(
      '/relatorio/dashboard/despesas-categorias-mes',
    ),
    ApiForbiddenErrorResponse('/relatorio/dashboard/despesas-categorias-mes'),
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
