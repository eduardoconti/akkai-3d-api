export interface ProdutoEstoqueNegativoResumo {
  id: number;
  codigo: number;
  nome: string;
  quantidadeEstoque: number;
}

export interface ProdutosEstoqueNegativo {
  total: number;
  itens: ProdutoEstoqueNegativoResumo[];
}

export abstract class ConsultaEstoqueNegativo {
  /** Produtos ativos com saldo de estoque menor que zero, do menor saldo. */
  abstract listarComEstoqueNegativo(
    limite: number,
  ): Promise<ProdutosEstoqueNegativo>;
}
