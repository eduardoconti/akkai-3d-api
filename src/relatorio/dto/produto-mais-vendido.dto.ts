export class ProdutoMaisVendidoDto {
  idProduto?: number | null;
  nomeProduto!: string;
  categoria?: {
    id: number;
    nome: string;
  } | null;
  quantidadeVendida!: number;
  descontoTotal!: number;
  valorTotal!: number;
}
