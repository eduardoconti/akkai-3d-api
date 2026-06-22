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
import { TrocaDevolucao } from './troca-devolucao.entity';

export enum TipoItemTrocaDevolucao {
  DEVOLVIDO = 'DEVOLVIDO',
  ENTREGUE = 'ENTREGUE',
}

export interface ItemTrocaDevolucaoInput {
  idProduto: number;
  quantidade: number;
  valorUnitario: number;
  tipo: TipoItemTrocaDevolucao;
}

@Entity('item_troca_devolucao')
@Check('ck_item_troca_devolucao_quantidade_positiva', '"quantidade" > 0')
@Check(
  'ck_item_troca_devolucao_valor_unitario_nao_negativo',
  '"valor_unitario" >= 0',
)
@Check(
  'ck_item_troca_devolucao_valor_total_consistente',
  '"valor_total" = ("quantidade" * "valor_unitario")',
)
@Index('idx_item_troca_devolucao_id_troca_devolucao', ['idTrocaDevolucao'])
@Index('idx_item_troca_devolucao_id_produto', ['idProduto'])
export class ItemTrocaDevolucao {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_item_troca_devolucao',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_troca_devolucao' })
  idTrocaDevolucao!: number;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @Column({
    type: 'enum',
    enum: TipoItemTrocaDevolucao,
    enumName: 'tipo_item_troca_devolucao_enum',
  })
  tipo!: TipoItemTrocaDevolucao;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'integer', name: 'valor_unitario' })
  valorUnitario!: number;

  @Column({ type: 'integer', name: 'valor_total' })
  valorTotal!: number;

  @ManyToOne(() => TrocaDevolucao, (trocaDevolucao) => trocaDevolucao.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_troca_devolucao',
    foreignKeyConstraintName: 'fk_item_troca_devolucao_troca_devolucao',
  })
  trocaDevolucao!: TrocaDevolucao;

  @ManyToOne(() => Produto, { nullable: false })
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_troca_devolucao_produto',
  })
  produto!: Produto;

  static criar(input: ItemTrocaDevolucaoInput): ItemTrocaDevolucao {
    const item = new ItemTrocaDevolucao();
    item.idProduto = input.idProduto;
    item.quantidade = input.quantidade;
    item.valorUnitario = input.valorUnitario;
    item.tipo = input.tipo;
    item.valorTotal = input.quantidade * input.valorUnitario;
    return item;
  }

  ehDevolvido(): boolean {
    return this.tipo === TipoItemTrocaDevolucao.DEVOLVIDO;
  }

  ehEntregue(): boolean {
    return this.tipo === TipoItemTrocaDevolucao.ENTREGUE;
  }
}
