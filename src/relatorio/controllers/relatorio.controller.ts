import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  DespesasCategoriasMesDashboardDto,
  ObterResumoMensalDashboardDto,
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ObterValorProdutosEstoqueDto,
  ProdutosMaisVendidosPeriodoDto,
  ResumoMensalDashboardDto,
  ResumoVendasPeriodoDto,
  TopProdutosMesDashboardDto,
  ValorProdutosEstoqueDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiProdutosMaisVendidosDocs,
  ApiDespesasCategoriasMesDashboardDocs,
  ApiTopProdutosMesDashboardDocs,
  ApiResumoMensalDashboardDocs,
  ApiResumoVendasPeriodoDocs,
  ApiValorProdutosEstoqueDocs,
} from '@relatorio/docs/relatorio-docs.decorator';

@ApiProtectedController('Relatórios')
@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @ApiResumoMensalDashboardDocs()
  @Get('dashboard/resumo-mensal')
  @Permissions('report.read')
  async obterResumoMensalDashboard(
    @Query() filtro: ObterResumoMensalDashboardDto,
  ): Promise<ResumoMensalDashboardDto> {
    return await this.relatorioService.obterResumoMensalDashboard(filtro);
  }

  @ApiTopProdutosMesDashboardDocs()
  @Get('dashboard/top-produtos-mes')
  @Permissions('report.read')
  async obterTopProdutosMesDashboard(): Promise<TopProdutosMesDashboardDto> {
    return await this.relatorioService.obterTopProdutosMesDashboard();
  }

  @ApiDespesasCategoriasMesDashboardDocs()
  @Get('dashboard/despesas-categorias-mes')
  @Permissions('report.read')
  async obterDespesasCategoriasMesDashboard(): Promise<DespesasCategoriasMesDashboardDto> {
    return await this.relatorioService.obterDespesasCategoriasMesDashboard();
  }

  @ApiResumoVendasPeriodoDocs()
  @Get('vendas/resumo')
  @Permissions('report.read')
  async obterResumoVendasPorPeriodo(
    @Query() filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    return await this.relatorioService.obterResumoVendasPorPeriodo(filtro);
  }

  @ApiProdutosMaisVendidosDocs()
  @Get('vendas/produtos-mais-vendidos')
  @Permissions('report.read')
  async obterProdutosMaisVendidosPorPeriodo(
    @Query() filtro: ObterProdutosMaisVendidosDto,
  ): Promise<ProdutosMaisVendidosPeriodoDto> {
    return await this.relatorioService.obterProdutosMaisVendidosPorPeriodo(
      filtro,
    );
  }

  @ApiValorProdutosEstoqueDocs()
  @Get('estoque/valor-produtos')
  @Permissions('report.read')
  async obterValorProdutosEstoque(
    @Query() filtro: ObterValorProdutosEstoqueDto,
  ): Promise<ValorProdutosEstoqueDto> {
    return await this.relatorioService.obterValorProdutosEstoque(filtro);
  }
}
