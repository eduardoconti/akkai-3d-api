export enum PrioridadeSugestaoProducao {
  CRITICO = 'CRITICO',
  PRODUZIR = 'PRODUZIR',
}

export class SugestaoProducaoProdutoDto {
  idProduto!: number;
  codigo!: number;
  nome!: string;
  categoria?: {
    id: number;
    nome: string;
  } | null;
  estoqueAtual!: number;
  estoqueMinimo!: number;
  quantidadeVendida!: number;
  mediaVendaDiaria!: number;
  demandaPlanejada!: number;
  estoqueSeguranca!: number;
  estoqueAlvo!: number;
  diasCobertura!: number | null;
  sugestaoProducao!: number;
  prioridade!: PrioridadeSugestaoProducao;
}
