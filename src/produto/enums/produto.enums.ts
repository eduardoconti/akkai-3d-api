export enum TipoMovimentacaoEstoque {
  ENTRADA = 'E',
  SAIDA = 'S',
}

export enum OrigemMovimentacaoEstoque {
  COMPRA = 'COMPRA',
  VENDA = 'VENDA',
  AJUSTE = 'AJUSTE',
  PERDA = 'PERDA',
  PRODUCAO = 'PRODUCAO',
  CONSIGNACAO = 'CONSIGNACAO',
  DEVOLUCAO = 'DEVOLUCAO',
  TROCA = 'TROCA',
}

export enum StatusProduto {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}
