import { SugestaoProducaoProdutoDto } from '@relatorio/dto/sugestao-producao-produto.dto';

export class RelatorioSugestaoProducaoDto {
  dataInicio!: string;
  dataFim!: string;
  diasHistorico!: number;
  diasPlanejamento!: number;
  diasEstoqueSeguranca!: number;
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
  totalQuantidadeSugerida!: number;
  itens!: SugestaoProducaoProdutoDto[];
}
