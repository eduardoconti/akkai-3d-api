import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MeioPagamento } from '@venda/entities/venda.entity';
import { Carteira } from './carteira.entity';

export enum CategoriaDespesa {
  DESPESA_FIXA = 'DESPESA_FIXA',
  MATERIA_PRIMA = 'MATERIA_PRIMA',
  EMBALAGEM = 'EMBALAGEM',
  EVENTO = 'EVENTO',
  TRANSPORTE = 'TRANSPORTE',
  OUTROS = 'OUTROS',
}

@Entity('despesa')
@Check('ck_despesa_valor_nao_negativo', '"valor" >= 0')
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

  @Column({
    type: 'enum',
    enum: CategoriaDespesa,
    enumName: 'categoria_despesa_enum',
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
