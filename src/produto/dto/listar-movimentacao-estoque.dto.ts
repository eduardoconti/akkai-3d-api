import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';

class ProdutoResumoMovimentacaoDto {
  id!: number;
  codigo!: number;
  nome!: string;
}

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
  produto?: ProdutoResumoMovimentacaoDto;
}
