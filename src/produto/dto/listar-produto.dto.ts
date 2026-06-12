class CategoriaProdutoResumoListaDto {
  id!: number;
  nome!: string;
}

export class ListarProdutoDto {
  id!: number;
  nome!: string;
  codigo!: number;
  descricao?: string;
  idCategoria!: number;
  estoqueMinimo?: number;
  valor!: number;
  quantidadeEstoque!: number;
  categoria!: CategoriaProdutoResumoListaDto;
}
