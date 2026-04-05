import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MeioPagamento } from '@venda/entities/venda.entity';
import { Carteira } from './carteira.entity';
import { CategoriaDespesa } from './categoria-despesa.entity';

@Entity('despesa')
@Check('ck_despesa_valor_nao_negativo', '"valor" >= 0')
@Index('idx_despesa_id_carteira', ['idCarteira'])
@Index('idx_despesa_id_categoria', ['idCategoria'])
@Index('idx_despesa_data_lancamento', ['dataLancamento'])
export class Despesa {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_despesa',
  })
  id!: number;

  @Column({
    type: 'timestamp',
    name: 'data_lancamento',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataLancamento!: Date;

  @Column({
    type: 'varchar',
    length: 255,
  })
  descricao!: string;

  @Column({
    type: 'integer',
  })
  valor!: number;

  @Column({ type: 'integer', name: 'id_categoria' })
  idCategoria!: number;

  @ManyToOne(() => CategoriaDespesa, (categoria) => categoria.despesas, {
    nullable: false,
  })
  @JoinColumn({
    name: 'id_categoria',
    foreignKeyConstraintName: 'fk_despesa_categoria_despesa',
  })
  categoria!: CategoriaDespesa;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    enumName: 'meio_pagamento_despesa_enum',
    name: 'meio_pagamento',
  })
  meioPagamento!: MeioPagamento;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao?: string;

  @Column({
    type: 'integer',
    name: 'id_carteira',
  })
  idCarteira!: number;

  @ManyToOne(() => Carteira, (carteira) => carteira.despesas, {
    nullable: false,
  })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_despesa_carteira',
  })
  carteira!: Carteira;
}
