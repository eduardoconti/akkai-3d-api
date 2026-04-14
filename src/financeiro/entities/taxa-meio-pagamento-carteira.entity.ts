import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  ValueTransformer,
} from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Carteira } from './carteira.entity';

const percentualTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value: string | number) => Number(value),
};

export interface TaxaMeioPagamentoCarteiraInput {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  percentual: number;
  ativa?: boolean;
}

export interface CriarTaxaMeioPagamentoCarteiraInput
  extends TaxaMeioPagamentoCarteiraInput {
  idUsuarioInclusao: number;
}

@Entity('taxa_meio_pagamento_carteira')
@Unique('uk_taxa_meio_pagamento_carteira_carteira_pagamento', [
  'idCarteira',
  'meioPagamento',
])
@Check(
  'ck_taxa_meio_pagamento_carteira_percentual_nao_negativo',
  '"percentual" >= 0',
)
@Check(
  'ck_taxa_meio_pagamento_carteira_percentual_maximo',
  '"percentual" <= 100',
)
@Index('idx_taxa_meio_pagamento_carteira_id_carteira', ['idCarteira'])
export class TaxaMeioPagamentoCarteira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_taxa_meio_pagamento_carteira',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName:
      'fk_taxa_meio_pagamento_carteira_usuario_inclusao',
  })
  usuarioInclusao!: User;

  @Column({ type: 'integer', name: 'id_carteira' })
  idCarteira!: number;

  @ManyToOne(() => Carteira, { nullable: false })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_taxa_meio_pagamento_carteira_carteira',
  })
  carteira!: Carteira;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    enumName: 'meio_pagamento_taxa_meio_pagamento_carteira_enum',
    name: 'meio_pagamento',
  })
  meioPagamento!: MeioPagamento;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: percentualTransformer,
  })
  percentual!: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  ativa!: boolean;

  static criar(
    input: CriarTaxaMeioPagamentoCarteiraInput,
  ): TaxaMeioPagamentoCarteira {
    const taxa = new TaxaMeioPagamentoCarteira();
    taxa.idUsuarioInclusao = input.idUsuarioInclusao;
    taxa.atualizar(input);
    return taxa;
  }

  atualizar(input: TaxaMeioPagamentoCarteiraInput): void {
    this.idCarteira = input.idCarteira;
    this.meioPagamento = input.meioPagamento;
    this.percentual = input.percentual;
    this.ativa = input.ativa ?? this.ativa;
  }
}
