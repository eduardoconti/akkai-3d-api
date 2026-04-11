class CategoriaProdutoResumoEstoqueDto {
  id!: number;
  nome!: string;
}

export class ListarProdutoEstoqueDto {
  id!: number;
  nome!: string;
  codigo!: string;
  descricao?: string;
  idCategoria!: number;
  estoqueMinimo?: number;
  categoria!: CategoriaProdutoResumoEstoqueDto;
  quantidadeEstoque!: number;
}
