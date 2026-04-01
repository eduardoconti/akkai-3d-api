import { ProdutoMaisVendidoDto } from '@relatorio/dto/produto-mais-vendido.dto';

export class ProdutosMaisVendidosPeriodoDto {
  dataInicio!: string;
  dataFim!: string;
  itens!: ProdutoMaisVendidoDto[];
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
}
