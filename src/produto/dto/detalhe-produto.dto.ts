class CategoriaProdutoResumoDto {
  id!: number;
  nome!: string;
}

export class DetalheProdutoDto {
  id!: number;
  nome!: string;
  codigo!: string;
  descricao?: string;
  idCategoria!: number;
  estoqueMinimo?: number;
  valor!: number;
  categoria!: CategoriaProdutoResumoDto;
  quantidadeEstoque!: number;
}
