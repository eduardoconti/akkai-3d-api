import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  ObterResumoVendasPeriodoDto,
  ResumoVendasPeriodoDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('vendas/resumo')
  @Permissions('report.read')
  async obterResumoVendasPorPeriodo(
    @Query() filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    return await this.relatorioService.obterResumoVendasPorPeriodo(filtro);
  }
}
