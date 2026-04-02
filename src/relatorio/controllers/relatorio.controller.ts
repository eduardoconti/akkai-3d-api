import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ProdutosMaisVendidosPeriodoDto,
  ResumoVendasPeriodoDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import {
  ApiProdutosMaisVendidosDocs,
  ApiResumoVendasPeriodoDocs,
} from '@relatorio/docs/relatorio-docs.decorator';

@ApiProtectedController('Relatórios')
@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

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
}
