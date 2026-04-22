import { ProducaoProdutoDto } from '@relatorio/dto/producao-produto.dto';

export class RelatorioProducaoDto {
  dataInicio!: string;
  dataFim!: string;
  diasNoPeriodo!: number;
  itens!: ProducaoProdutoDto[];
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
  totalQuantidadeProduzida!: number;
  totalValorEstimado!: number;
  mediaQuantidadePorDia!: number;
  mediaValorPorDia!: number;
}
