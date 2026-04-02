class CategoriaProdutoResumoListaDto {
  id!: number;
  nome!: string;
}

export class ListarProdutoDto {
  id!: number;
  nome!: string;
  codigo!: string;
  descricao?: string;
  idCategoria!: number;
  estoqueMinimo?: number;
  valor!: number;
  categoria!: CategoriaProdutoResumoListaDto;
  quantidadeEstoque!: number;
}
