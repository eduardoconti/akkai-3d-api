import { Controller, Get, Query } from '@nestjs/common';
import {
  ObterResumoVendasPeriodoDto,
  ResumoVendasPeriodoDto,
} from '@relatorio/dto';
import { RelatorioService } from '@relatorio/services';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('vendas/resumo')
  async obterResumoVendasPorPeriodo(
    @Query() filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    return await this.relatorioService.obterResumoVendasPorPeriodo(filtro);
  }
}
