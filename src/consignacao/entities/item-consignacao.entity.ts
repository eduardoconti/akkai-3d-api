import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Produto } from '@produto/entities';
import { Consignacao } from './consignacao.entity';

export interface CriarItemConsignacaoInput {
  idProduto: number;
  quantidadeEnviada: number;
}

@Entity('item_consignacao')
@Unique('uk_item_consignacao_consignacao_produto', [
  'idConsignacao',
  'idProduto',
])
@Check(
  'ck_item_consignacao_quantidade_enviada_positiva',
  '"quantidade_enviada" > 0',
)
@Check(
  'ck_item_consignacao_quantidade_vendida_nao_negativa',
  '"quantidade_vendida" >= 0',
)
@Check(
  'ck_item_consignacao_quantidade_devolvida_nao_negativa',
  '"quantidade_devolvida" >= 0',
)
@Check(
  'ck_item_consignacao_quantidades_movimentadas_validas',
  '"quantidade_vendida" + "quantidade_devolvida" <= "quantidade_enviada"',
)
@Index('idx_item_consignacao_id_consignacao', ['idConsignacao'])
@Index('idx_item_consignacao_id_produto', ['idProduto'])
export class ItemConsignacao {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_item_consignacao',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_consignacao' })
  idConsignacao!: number;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @Column({ type: 'integer', name: 'quantidade_enviada' })
  quantidadeEnviada!: number;

  @Column({ type: 'integer', name: 'quantidade_vendida', default: 0 })
  quantidadeVendida!: number;

  @Column({ type: 'integer', name: 'quantidade_devolvida', default: 0 })
  quantidadeDevolvida!: number;

  @ManyToOne(() => Consignacao, (consignacao) => consignacao.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_consignacao',
    foreignKeyConstraintName: 'fk_item_consignacao_consignacao',
  })
  consignacao!: Consignacao;

  @ManyToOne(() => Produto)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_consignacao_produto',
  })
  produto!: Produto;

  get quantidadeDisponivel(): number {
    return (
      this.quantidadeEnviada - this.quantidadeVendida - this.quantidadeDevolvida
    );
  }

  static criar(input: CriarItemConsignacaoInput): ItemConsignacao {
    const item = new ItemConsignacao();
    item.idProduto = input.idProduto;
    item.quantidadeEnviada = input.quantidadeEnviada;
    item.quantidadeVendida = 0;
    item.quantidadeDevolvida = 0;
    return item;
  }
}
