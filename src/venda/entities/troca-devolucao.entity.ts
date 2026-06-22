import { BadRequestException } from '@nestjs/common';
import { User } from '@auth/entities/user.entity';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Carteira } from '@financeiro/entities';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ItemTrocaDevolucao,
  ItemTrocaDevolucaoInput,
} from './item-troca-devolucao.entity';

export enum TipoDiferencaTrocaDevolucao {
  A_PAGAR = 'A_PAGAR',
  A_DEVOLVER = 'A_DEVOLVER',
  SEM_DIFERENCA = 'SEM_DIFERENCA',
}

export interface TrocaDevolucaoInput {
  dataTrocaDevolucao: string | Date;
  itens: ItemTrocaDevolucaoInput[];
  idCarteira?: number;
  meioPagamento?: MeioPagamento;
  observacao?: string;
}

export interface CriarTrocaDevolucaoInput extends TrocaDevolucaoInput {
  idUsuarioInclusao: number;
}

@Entity('troca_devolucao')
@Check(
  'ck_troca_devolucao_valor_devolvido_nao_negativo',
  '"valor_devolvido" >= 0',
)
@Check('ck_troca_devolucao_valor_novo_nao_negativo', '"valor_novo" >= 0')
@Check(
  'ck_troca_devolucao_valor_diferenca_nao_negativo',
  '"valor_diferenca" >= 0',
)
@Index('idx_troca_devolucao_data', ['dataTrocaDevolucao'])
@Index('idx_troca_devolucao_id_carteira', ['idCarteira'])
export class TrocaDevolucao {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_troca_devolucao',
  })
  id!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({
    type: 'timestamp',
    name: 'data_troca_devolucao',
  })
  dataTrocaDevolucao!: Date;

  @Column({ type: 'integer', name: 'valor_devolvido' })
  valorDevolvido!: number;

  @Column({ type: 'integer', name: 'valor_novo' })
  valorNovo!: number;

  @Column({ type: 'integer', name: 'valor_diferenca' })
  valorDiferenca!: number;

  @Column({
    type: 'enum',
    enum: TipoDiferencaTrocaDevolucao,
    enumName: 'tipo_diferenca_troca_devolucao_enum',
    name: 'tipo_diferenca',
  })
  tipoDiferenca!: TipoDiferencaTrocaDevolucao;

  @Column({ type: 'integer', name: 'id_carteira', nullable: true })
  idCarteira?: number;

  @ManyToOne(() => Carteira, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_troca_devolucao_carteira',
  })
  carteira?: Carteira;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    enumName: 'meio_pagamento_troca_devolucao_enum',
    name: 'meio_pagamento',
    nullable: true,
  })
  meioPagamento?: MeioPagamento;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao?: string;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_troca_devolucao_usuario_inclusao',
  })
  usuarioInclusao!: User;

  @OneToMany(() => ItemTrocaDevolucao, (item) => item.trocaDevolucao, {
    cascade: true,
  })
  itens!: ItemTrocaDevolucao[];

  static criar(input: CriarTrocaDevolucaoInput): TrocaDevolucao {
    const trocaDevolucao = new TrocaDevolucao();
    trocaDevolucao.dataInclusao = new Date();
    trocaDevolucao.idUsuarioInclusao = input.idUsuarioInclusao;
    trocaDevolucao.atualizar(input);
    return trocaDevolucao;
  }

  atualizar(input: TrocaDevolucaoInput): void {
    this.dataTrocaDevolucao = this.criarData(input.dataTrocaDevolucao);
    this.idCarteira = input.idCarteira;
    this.meioPagamento = input.meioPagamento;
    this.observacao = input.observacao?.trim();
    this.itens = input.itens.map((item) => ItemTrocaDevolucao.criar(item));
    this.calcularTotais();
    this.validar();
  }

  private criarData(dataTrocaDevolucao: string | Date): Date {
    const data = new Date(dataTrocaDevolucao);

    if (Number.isNaN(data.getTime())) {
      throw new BadRequestException(
        'A data da troca/devolução deve ser válida.',
      );
    }

    return data;
  }

  private calcularTotais(): void {
    this.valorDevolvido = this.itens
      .filter((item) => item.ehDevolvido())
      .reduce((total, item) => total + item.valorTotal, 0);
    this.valorNovo = this.itens
      .filter((item) => item.ehEntregue())
      .reduce((total, item) => total + item.valorTotal, 0);
    this.valorDiferenca = Math.abs(this.valorNovo - this.valorDevolvido);

    if (this.valorNovo > this.valorDevolvido) {
      this.tipoDiferenca = TipoDiferencaTrocaDevolucao.A_PAGAR;
      return;
    }

    if (this.valorNovo < this.valorDevolvido) {
      this.tipoDiferenca = TipoDiferencaTrocaDevolucao.A_DEVOLVER;
      return;
    }

    this.tipoDiferenca = TipoDiferencaTrocaDevolucao.SEM_DIFERENCA;
  }

  private validar(): void {
    if (!this.itens.some((item) => item.ehDevolvido())) {
      throw new BadRequestException(
        'A troca/devolução deve possuir ao menos 1 item devolvido.',
      );
    }

    if (this.valorDiferenca > 0 && (!this.idCarteira || !this.meioPagamento)) {
      throw new BadRequestException(
        'Informe a carteira e o meio de pagamento para registrar a diferença.',
      );
    }
  }
}
