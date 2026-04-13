import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  ObterResumoMensalDashboardDto,
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ObterValorProdutosEstoqueDto,
  ProdutosMaisVendidosPeriodoDto,
  ResumoMensalDashboardDto,
  ResumoVendasPeriodoDto,
  ValorProdutosEstoqueDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import {
  ApiProdutosMaisVendidosDocs,
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
