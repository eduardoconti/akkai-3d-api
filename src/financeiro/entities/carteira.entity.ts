import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Venda } from '@venda/entities/venda.entity';
import { Despesa } from './despesa.entity';
import { TaxaMeioPagamentoCarteira } from './taxa-meio-pagamento-carteira.entity';

const percentualTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | number | null) =>
    value === null || value === undefined ? null : Number(value),
};

@Entity('carteira')
export class Carteira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_carteira',
  })
  id!: number;

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
  })
  nome!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  ativa!: boolean;

  @Column({
    type: 'simple-json',
    name: 'meios_pagamento',
    default: '[]',
  })
  meiosPagamento!: MeioPagamento[];

  @Column({
    type: 'boolean',
    name: 'considera_imposto_venda',
    default: false,
  })
  consideraImpostoVenda!: boolean;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: percentualTransformer,
    name: 'percentual_imposto_venda',
    nullable: true,
  })
  percentualImpostoVenda?: number | null;

  @OneToMany(() => Venda, (venda) => venda.carteira)
  vendas!: Venda[];

  @OneToMany(() => Despesa, (despesa) => despesa.carteira)
  despesas!: Despesa[];

  @OneToMany(() => TaxaMeioPagamentoCarteira, (taxa) => taxa.carteira)
  taxasMeioPagamento!: TaxaMeioPagamentoCarteira[];

  aceitaMeioPagamento(meioPagamento: MeioPagamento): boolean {
    return (
      this.meiosPagamento.length === 0 ||
      this.meiosPagamento.includes(meioPagamento)
    );
  }
}
