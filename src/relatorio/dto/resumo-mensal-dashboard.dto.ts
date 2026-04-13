import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ResumoMensalDashboardItemDto } from './resumo-mensal-dashboard-item.dto';

export class ObterResumoMensalDashboardDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(2000, { message: 'O ano deve ser maior ou igual a 2000.' })
  @Max(2100, { message: 'O ano deve ser menor ou igual a 2100.' })
  ano = new Date().getFullYear();
}

export class ResumoMensalDashboardDto {
  ano!: number;
  totalQuantidadeItensVendidos!: number;
  totalVendas!: number;
  totalDespesas!: number;
  saldo!: number;
  itens!: ResumoMensalDashboardItemDto[];
}
