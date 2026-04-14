import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Carteira } from './carteira.entity';
import { CategoriaDespesa } from './categoria-despesa.entity';

export interface DespesaInput {
  dataLancamento: string;
  descricao: string;
  valor: number;
  idCategoria: number;
  meioPagamento: MeioPagamento;
  idCarteira: number;
  observacao?: string;
}

export interface CriarDespesaInput extends DespesaInput {
  idUsuarioInclusao: number;
}

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

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_despesa_usuario_inclusao',
  })
  usuarioInclusao!: User;

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

  static criar(input: CriarDespesaInput): Despesa {
    const despesa = new Despesa();
    despesa.idUsuarioInclusao = input.idUsuarioInclusao;
    despesa.atualizar(input);
    return despesa;
  }

  atualizar(input: DespesaInput): void {
    this.dataLancamento = new Date(input.dataLancamento);
    this.descricao = input.descricao.trim();
    this.valor = input.valor;
    this.idCategoria = input.idCategoria;
    this.meioPagamento = input.meioPagamento;
    this.idCarteira = input.idCarteira;
    this.observacao = input.observacao?.trim();
  }
}
