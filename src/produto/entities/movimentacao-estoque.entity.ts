import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from '@produto/entities';

export enum TipoMovimentacaoEstoque {
  ENTRADA = 'E',
  SAIDA = 'S',
}

export enum OrigemMovimentacaoEstoque {
  COMPRA = 'COMPRA',
  VENDA = 'VENDA',
  AJUSTE = 'AJUSTE',
  PERDA = 'PERDA',
  PRODUCAO = 'PRODUCAO',
}

@Entity('movimentacao_estoque')
@Check('ck_movimentacao_estoque_quantidade_positiva', '"quantidade" > 0')
@Index('idx_movimentacao_estoque_id_produto', ['idProduto'])
@Index('idx_movimentacao_estoque_id_produto_tipo', ['idProduto', 'tipo'])
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_movimentacao_estoque',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({
    type: 'enum',
    enum: TipoMovimentacaoEstoque,
    enumName: 'tipo_movimentacao_estoque_enum',
  })
  tipo!: TipoMovimentacaoEstoque;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({
    type: 'enum',
    enum: OrigemMovimentacaoEstoque,
    enumName: 'origem_movimentacao_estoque_enum',
  })
  origem!: OrigemMovimentacaoEstoque;

  @ManyToOne(() => Produto, (produto) => produto.movimentacoesEstoque)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_movimentacao_estoque_produto',
  })
  produto!: Produto;

  constructor() {}
}
