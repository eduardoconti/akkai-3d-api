export class ListarMovimentacaoEstoqueDto {
  id!: number;
  idProduto!: number;
  idItemVenda?: number;
  usuario!: string;
  quantidade!: number;
  tipo!: 'E' | 'S';
  origem!: 'COMPRA' | 'VENDA' | 'AJUSTE' | 'PERDA' | 'PRODUCAO';
  dataInclusao!: Date;
}
