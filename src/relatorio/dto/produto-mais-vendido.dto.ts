export class ProdutoMaisVendidoDto {
  idProduto?: number | null;
  codigo?: number | null;
  nomeProduto!: string;
  categoria?: {
    id: number;
    nome: string;
  } | null;
  quantidadeVendida!: number;
}
