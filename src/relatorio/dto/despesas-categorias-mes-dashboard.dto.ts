import { DespesaCategoriaMesDashboardItemDto } from './despesa-categoria-mes-dashboard-item.dto';

export class DespesasCategoriasMesDashboardDto {
  ano!: number;
  mes!: number;
  itens!: DespesaCategoriaMesDashboardItemDto[];
}
