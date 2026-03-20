import { Produto } from 'src/produto/model/produto.model';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

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

export interface ItemVendaInput {
  quantidade: number;
  valorUnitario: number;
  desconto?: number;
  idProduto: number;
}

import { ManyToOne } from 'typeorm';

@Entity()
@Unique('uk_venda_produto', ['idVenda', 'idProduto'])
@Check('chk_quantidade', 'quantidade > 0')
@Check('chk_valor_unitario', '"valor_unitario" >= 0')
@Check('chk_desconto', 'desconto >= 0')
export class ItemVenda {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'id_venda' })
  idVenda: number;
  @Column({ name: 'id_produto' })
  idProduto: number;
  @Column()
  quantidade: number;
  @Column({ name: 'valor_unitario' })
  valorUnitario: number;
  @Column({ name: 'valor_total' })
  valorTotal: number;
  @Column({ default: 0 })
  desconto: number;

  @ManyToOne(() => Venda, (venda) => venda.itens)
  @JoinColumn({
    name: 'id_venda',
    foreignKeyConstraintName: 'fk_item_venda_venda',
  })
  venda: Venda;

  @ManyToOne(() => Produto, (produto) => produto.itensVenda)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_venda_produto',
  })
  produto: Produto;
  constructor() {}

  static criar(inserirItemVendaInput: ItemVendaInput): ItemVenda {
    const itemVenda = new ItemVenda();
    itemVenda.idProduto = inserirItemVendaInput.idProduto;
    itemVenda.quantidade = inserirItemVendaInput.quantidade;
    itemVenda.valorUnitario = inserirItemVendaInput.valorUnitario;
    itemVenda.desconto = inserirItemVendaInput.desconto ?? 0;

    itemVenda.calcularValorTotal();

    return itemVenda;
  }

  setId(id: number): void {
    this.id = id;
  }

  setIdVenda(idVenda: number): void {
    this.idVenda = idVenda;
  }

  private calcularValorTotal(): void {
    const valorBruto = this.quantidade * this.valorUnitario;
    const valorDesconto = this.desconto ?? 0;

    this.valorTotal = valorBruto - valorDesconto;
  }
}
