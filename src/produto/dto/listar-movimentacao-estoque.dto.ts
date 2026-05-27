import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';

export class ListarMovimentacaoEstoqueDto {
  id!: number;
  idProduto!: number;
  idItemVenda?: number;
  usuario!: string;
  quantidade!: number;
  tipo!: TipoMovimentacaoEstoque;
  origem!: OrigemMovimentacaoEstoque;
  dataInclusao!: Date;
}
