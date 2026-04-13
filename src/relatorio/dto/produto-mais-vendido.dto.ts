export class ProdutoMaisVendidoDto {
  idProduto?: number | null;
  codigo?: string | null;
  nomeProduto!: string;
  categoria?: {
    id: number;
    nome: string;
  } | null;
  quantidadeVendida!: number;
}
