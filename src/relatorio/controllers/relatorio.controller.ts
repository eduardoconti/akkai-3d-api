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
  obterResumoMensalDashboard(
    @Query() filtro: ObterResumoMensalDashboardDto,
  ): Promise<ResumoMensalDashboardDto> {
    return this.relatorioService.obterResumoMensalDashboard(filtro);
  }

  @ApiTopProdutosMesDashboardDocs()
  @Get('dashboard/top-produtos-mes')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterTopProdutosMesDashboard(): Promise<TopProdutosMesDashboardDto> {
    return this.relatorioService.obterTopProdutosMesDashboard();
  }

  @ApiDespesasCategoriasMesDashboardDocs()
  @Get('dashboard/despesas-categorias-mes')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterDespesasCategoriasMesDashboard(): Promise<DespesasCategoriasMesDashboardDto> {
    return this.relatorioService.obterDespesasCategoriasMesDashboard();
  }

  @ApiResumoVendasPeriodoDocs()
  @Get('vendas/resumo')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterResumoVendasPorPeriodo(
    @Query() filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    return this.relatorioService.obterResumoVendasPorPeriodo(filtro);
  }

  @ApiProdutosMaisVendidosDocs()
  @Get('vendas/produtos-mais-vendidos')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterProdutosMaisVendidosPorPeriodo(
    @Query() filtro: ObterProdutosMaisVendidosDto,
  ): Promise<ProdutosMaisVendidosPeriodoDto> {
    return this.relatorioService.obterProdutosMaisVendidosPorPeriodo(filtro);
  }

  @ApiValorProdutosEstoqueDocs()
  @Get('estoque/valor-produtos')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterValorProdutosEstoque(
    @Query() filtro: ObterValorProdutosEstoqueDto,
  ): Promise<ValorProdutosEstoqueDto> {
    return this.relatorioService.obterValorProdutosEstoque(filtro);
  }

  @ApiSugestaoProducaoDocs()
  @Get('producao/sugestao')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterSugestaoProducao(
    @Query() filtro: ObterSugestaoProducaoDto,
  ): Promise<RelatorioSugestaoProducaoDto> {
    return this.relatorioService.obterSugestaoProducao(filtro);
  }

  @ApiRelatorioProducaoDocs()
  @Get('producao')
  @Permissions(PERMISSOES.RELATORIO.LER)
  obterRelatorioProducao(
    @Query() filtro: ObterRelatorioProducaoDto,
  ): Promise<RelatorioProducaoDto> {
    return this.relatorioService.obterRelatorioProducao(filtro);
  }
}
