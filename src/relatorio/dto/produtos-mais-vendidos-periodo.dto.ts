import { ProdutoMaisVendidoDto } from '@relatorio/dto/produto-mais-vendido.dto';

export class ProdutosMaisVendidosPeriodoDto {
  dataInicio!: string | null;
  dataFim!: string | null;
  itens!: ProdutoMaisVendidoDto[];
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
}
