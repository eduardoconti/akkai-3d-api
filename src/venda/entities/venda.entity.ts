import {
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemVenda, ItemVendaInput } from '@venda/entities/item-venda.entity';

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
  desconto?: number;
  itens: ItemVendaInput[];
}
@Entity()
@Check('chk_valor_desconto', '"desconto" >= 0')
@Check('chk_valor_total', '"valor_total" >= 0')
export class Venda {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao: Date;
  @Column({ name: 'valor_total' })
  valorTotal: number;
  @Column({ type: 'enum', enum: TipoVenda })
  tipo: TipoVenda;
  @Column({ type: 'enum', enum: MeioPagamento, name: 'meio_pagamento' })
  meioPagamento: MeioPagamento;
  @Column({ default: 0 })
  desconto: number;
  @OneToMany(() => ItemVenda, (itemVenda) => itemVenda.venda, {
    cascade: true,
  })
  itens: ItemVenda[];

  constructor() {}

  static criar(inserirVendaInput: InserirVendaInput): Venda {
    const itens = inserirVendaInput.itens.map((item) =>
      ItemVenda.criar({
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        desconto: item.desconto,
        idProduto: item.idProduto,
      }),
    );

    const venda = new Venda();
    venda.dataInclusao = new Date();
    venda.tipo = inserirVendaInput.tipo;
    venda.meioPagamento = inserirVendaInput.meioPagamento;
    venda.desconto = inserirVendaInput.desconto ?? 0;
    venda.itens = itens;

    venda.calcularValorTotal();
    return venda;
  }

  private calcularValorTotal(): void {
    this.valorTotal =
      this.itens.reduce((total, item) => total + item.valorTotal, 0) -
      this.desconto;

    this.desconto =
      this.itens.reduce((total, item) => total + (item.desconto ?? 0), 0) +
      this.desconto;
  }
}
