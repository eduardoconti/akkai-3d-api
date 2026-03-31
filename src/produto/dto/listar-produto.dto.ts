export interface ListarProdutoDto {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  idCategoria: number;
  estoqueMinimo?: number;
  valor: number;
  categoria: {
    id: number;
    nome: string;
  };
  quantidadeEstoque: number;
}
