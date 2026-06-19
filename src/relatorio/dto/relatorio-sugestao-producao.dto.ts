import { SugestaoProducaoProdutoDto } from '@relatorio/dto/sugestao-producao-produto.dto';

export class RelatorioSugestaoProducaoDto {
  dataInicio!: string;
  dataFim!: string;
  feirasHistorico!: number;
  feirasConsideradas!: number;
  feirasPlanejamento!: number;
  feirasEstoqueSeguranca!: number;
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
  totalQuantidadeSugerida!: number;
  itens!: SugestaoProducaoProdutoDto[];
}
