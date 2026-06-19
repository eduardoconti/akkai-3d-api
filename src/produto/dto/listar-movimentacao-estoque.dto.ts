import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';

export class ListarMovimentacaoEstoqueDto {
  id!: number;
  idProduto!: number;
  idItemVenda?: number;
  idVenda?: number;
  brinde?: boolean;
  usuario!: string;
  quantidade!: number;
  tipo!: TipoMovimentacaoEstoque;
  origem!: OrigemMovimentacaoEstoque;
  dataInclusao!: Date;
}
