export class ListarMovimentacaoEstoqueDto {
  id!: number;
  idProduto!: number;
  idItemVenda?: number;
  quantidade!: number;
  tipo!: 'E' | 'S';
  origem!: 'COMPRA' | 'VENDA' | 'AJUSTE' | 'PERDA' | 'PRODUCAO';
  dataInclusao!: Date;
}
