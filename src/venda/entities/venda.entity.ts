import { BadRequestException } from '@nestjs/common';
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
import { Carteira } from '@financeiro/entities/carteira.entity';
import { Feira } from './feira.entity';
import { ItemVenda, ItemVendaInput } from './item-venda.entity';

export enum MeioPagamento {
  DIN = 'DIN',
  DEB = 'DEB',
  CRE = 'CRE',
  PIX = 'PIX',
}

export enum TipoVenda {
  FEIRA = 'FEIRA',
  LOJA = 'LOJA',
  ONLINE = 'ONLINE',
}
export interface InserirVendaInput {
  tipo: TipoVenda;
  meioPagamento: MeioPagamento;
  idCarteira: number;
  idFeira?: number;
  desconto?: number;
  itens: ItemVendaInput[];
}
@Entity('venda')
@Check('ck_venda_desconto_nao_negativo', '"desconto" >= 0')
@Check('ck_venda_valor_total_nao_negativo', '"valor_total" >= 0')
@Index('idx_venda_id_carteira', ['idCarteira'])
@Index('idx_venda_id_feira', ['idFeira'])
@Index('idx_venda_data_inclusao', ['dataInclusao'])
@Index('idx_venda_data_inclusao_tipo', ['dataInclusao', 'tipo'])
export class Venda {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_venda',
  })
  id!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({ type: 'integer', name: 'valor_total' })
  valorTotal!: number;

  @Column({ type: 'enum', enum: TipoVenda, enumName: 'tipo_venda_enum' })
  tipo!: TipoVenda;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    enumName: 'meio_pagamento_venda_enum',
    name: 'meio_pagamento',
  })
  meioPagamento!: MeioPagamento;

  @Column({ type: 'integer', default: 0 })
  desconto!: number;

  @Column({ type: 'integer', name: 'id_carteira', nullable: true })
  idCarteira?: number;

  @ManyToOne(() => Carteira, (carteira) => carteira.vendas, { nullable: true })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_venda_carteira',
  })
  carteira?: Carteira;

  @Column({ type: 'integer', name: 'id_feira', nullable: true })
  idFeira?: number;

  @ManyToOne(() => Feira, (feira) => feira.vendas, { nullable: true })
  @JoinColumn({
    name: 'id_feira',
    foreignKeyConstraintName: 'fk_venda_feira',
  })
  feira?: Feira;

  @OneToMany(() => ItemVenda, (itemVenda) => itemVenda.venda, {
    cascade: true,
  })
  itens!: ItemVenda[];

  constructor() {}

  static criar(inserirVendaInput: InserirVendaInput): Venda {
    const venda = new Venda();
    venda.dataInclusao = new Date();
    venda.atualizar(inserirVendaInput);
    return venda;
  }

  atualizar(inserirVendaInput: InserirVendaInput): void {
    this.tipo = inserirVendaInput.tipo;
    this.meioPagamento = inserirVendaInput.meioPagamento;
    this.idCarteira = inserirVendaInput.idCarteira;
    this.idFeira = inserirVendaInput.idFeira;
    this.desconto = inserirVendaInput.desconto ?? 0;
    this.itens = inserirVendaInput.itens.map((item) => ItemVenda.criar(item));

    this.calcularValorTotal();
  }

  private calcularValorTotal(): void {
    const totalItens = this.itens.reduce(
      (total, item) => total + item.valorTotal,
      0,
    );

    if (this.desconto > totalItens) {
      throw new BadRequestException(
        'O desconto não pode ser maior que o valor total dos itens.',
      );
    }

    this.valorTotal = totalItens - this.desconto;
  }
}
