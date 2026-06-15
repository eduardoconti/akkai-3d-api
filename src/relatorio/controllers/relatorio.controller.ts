import { Controller, Get, Query } from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  DespesasCategoriasMesDashboardDto,
  ObterRelatorioProducaoDto,
  ObterResumoMensalDashboardDto,
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ObterSugestaoProducaoDto,
  ObterValorProdutosEstoqueDto,
  ProdutosMaisVendidosPeriodoDto,
  RelatorioProducaoDto,
  RelatorioSugestaoProducaoDto,
  ResumoMensalDashboardDto,
  ResumoVendasPeriodoDto,
  TopProdutosMesDashboardDto,
  ValorProdutosEstoqueDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiProdutosMaisVendidosDocs,
  ApiRelatorioProducaoDocs,
  ApiDespesasCategoriasMesDashboardDocs,
  ApiSugestaoProducaoDocs,
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
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterResumoMensalDashboard(
    @Query() filtro: ObterResumoMensalDashboardDto,
  ): Promise<ResumoMensalDashboardDto> {
    return await this.relatorioService.obterResumoMensalDashboard(filtro);
  }

  @ApiTopProdutosMesDashboardDocs()
  @Get('dashboard/top-produtos-mes')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterTopProdutosMesDashboard(): Promise<TopProdutosMesDashboardDto> {
    return await this.relatorioService.obterTopProdutosMesDashboard();
  }

  @ApiDespesasCategoriasMesDashboardDocs()
  @Get('dashboard/despesas-categorias-mes')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterDespesasCategoriasMesDashboard(): Promise<DespesasCategoriasMesDashboardDto> {
    return await this.relatorioService.obterDespesasCategoriasMesDashboard();
  }

  @ApiResumoVendasPeriodoDocs()
  @Get('vendas/resumo')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterResumoVendasPorPeriodo(
    @Query() filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    return await this.relatorioService.obterResumoVendasPorPeriodo(filtro);
  }

  @ApiProdutosMaisVendidosDocs()
  @Get('vendas/produtos-mais-vendidos')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterProdutosMaisVendidosPorPeriodo(
    @Query() filtro: ObterProdutosMaisVendidosDto,
  ): Promise<ProdutosMaisVendidosPeriodoDto> {
    return await this.relatorioService.obterProdutosMaisVendidosPorPeriodo(
      filtro,
    );
  }

  @ApiValorProdutosEstoqueDocs()
  @Get('estoque/valor-produtos')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterValorProdutosEstoque(
    @Query() filtro: ObterValorProdutosEstoqueDto,
  ): Promise<ValorProdutosEstoqueDto> {
    return await this.relatorioService.obterValorProdutosEstoque(filtro);
  }

  @ApiSugestaoProducaoDocs()
  @Get('producao/sugestao')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterSugestaoProducao(
    @Query() filtro: ObterSugestaoProducaoDto,
  ): Promise<RelatorioSugestaoProducaoDto> {
    return await this.relatorioService.obterSugestaoProducao(filtro);
  }

  @ApiRelatorioProducaoDocs()
  @Get('producao')
  @Permissions(PERMISSOES.RELATORIO.LER)
  async obterRelatorioProducao(
    @Query() filtro: ObterRelatorioProducaoDto,
  ): Promise<RelatorioProducaoDto> {
    return await this.relatorioService.obterRelatorioProducao(filtro);
  }
}
