export interface DetalheProdutoDto {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  estoqueMinimo?: number;
  valor: number;
  categoria: {
    id: number;
    nome: string;
  };
  quantidadeEstoque: number;
}
