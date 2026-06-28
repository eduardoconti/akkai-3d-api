import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { Carteira } from '@financeiro/entities/carteira.entity';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Venda } from './venda.entity';

const percentualTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | number | null) =>
    value === null || value === undefined ? null : Number(value),
};

export interface PagamentoVendaInput {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  valor: number;
  percentualTaxa?: number | null;
  percentualImposto?: number | null;
}

@Entity('pagamento_venda')
@Check('ck_pagamento_venda_valor_nao_negativo', '"valor" >= 0')
@Check('ck_pagamento_venda_valor_taxa_nao_negativo', '"valor_taxa" >= 0')
@Check('ck_pagamento_venda_valor_imposto_nao_negativo', '"valor_imposto" >= 0')
@Index('idx_pagamento_venda_id_venda', ['idVenda'])
@Index('idx_pagamento_venda_id_carteira', ['idCarteira'])
@Index('idx_pagamento_venda_meio_pagamento', ['meioPagamento'])
export class PagamentoVenda {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_pagamento_venda',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_venda' })
  idVenda!: number;

  @ManyToOne(() => Venda, (venda) => venda.pagamentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_venda',
    foreignKeyConstraintName: 'fk_pagamento_venda_venda',
  })
  venda!: Venda;

  @Column({ type: 'integer', name: 'id_carteira' })
  idCarteira!: number;

  @ManyToOne(() => Carteira, { onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_pagamento_venda_carteira',
  })
  carteira!: Carteira;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    enumName: 'meio_pagamento_pagamento_venda_enum',
    name: 'meio_pagamento',
  })
  meioPagamento!: MeioPagamento;

  @Column({ type: 'integer' })
  valor!: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: percentualTransformer,
    name: 'percentual_taxa',
    nullable: true,
  })
  percentualTaxa?: number | null;

  @Column({ type: 'integer', name: 'valor_taxa', nullable: true })
  valorTaxa?: number | null;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: percentualTransformer,
    name: 'percentual_imposto',
    nullable: true,
  })
  percentualImposto?: number | null;

  @Column({ type: 'integer', name: 'valor_imposto', nullable: true })
  valorImposto?: number | null;

  static criar(input: PagamentoVendaInput): PagamentoVenda {
    const pagamento = new PagamentoVenda();
    pagamento.idCarteira = input.idCarteira;
    pagamento.meioPagamento = input.meioPagamento;
    pagamento.valor = input.valor;
    pagamento.percentualTaxa = input.percentualTaxa ?? null;
    pagamento.percentualImposto = input.percentualImposto ?? null;
    pagamento.calcularValorTaxa();
    pagamento.calcularValorImposto();
    return pagamento;
  }

  private calcularValorPercentual(percentual?: number | null): number | null {
    if (percentual === null || percentual === undefined) {
      return null;
    }

    return Math.round((this.valor * percentual) / 100);
  }

  private calcularValorTaxa(): void {
    this.valorTaxa = this.calcularValorPercentual(this.percentualTaxa);
  }

  private calcularValorImposto(): void {
    this.valorImposto = this.calcularValorPercentual(this.percentualImposto);
  }
}
