import { ProdutoMaisVendidoDto } from './produto-mais-vendido.dto';

export class TopProdutosMesDashboardDto {
  ano!: number;
  mes!: number;
  itens!: ProdutoMaisVendidoDto[];
}
