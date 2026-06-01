import { StatusConsignacao, StatusRevendedor } from '@consignacao/entities';

export class RevendedorResumoDto {
  id!: number;
  nome!: string;
  telefone!: string;
  status!: StatusRevendedor;
}

export class ItemConsignacaoDto {
  id!: number;
  idProduto!: number;
  nomeProduto!: string;
  codigoProduto!: number;
  quantidadeEnviada!: number;
  quantidadeVendida!: number;
  quantidadeDevolvida!: number;
  quantidadeDisponivel!: number;
  valorUnitario!: number;
}

export class ListarConsignacaoDto {
  id!: number;
  revendedor!: RevendedorResumoDto;
  status!: StatusConsignacao;
  dataInclusao!: Date;
  quantidadeEnviada!: number;
  quantidadeVendida!: number;
  quantidadeDevolvida!: number;
  quantidadeDisponivel!: number;
}

export class DetalheConsignacaoDto extends ListarConsignacaoDto {
  itens!: ItemConsignacaoDto[];
}
