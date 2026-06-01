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
import { User } from '@auth/entities/user.entity';
import { Consignacao } from '@consignacao/entities/consignacao.entity';
import { Feira } from './feira.entity';
import { ItemVenda, ItemVendaInput } from './item-venda.entity';
import { PagamentoVenda, PagamentoVendaInput } from './pagamento-venda.entity';

export enum TipoVenda {
  FEIRA = 'FEIRA',
  LOJA = 'LOJA',
  ONLINE = 'ONLINE',
  CONSIGNACAO = 'CONSIGNACAO',
}
export interface InserirVendaInput {
  tipo: TipoVenda;
  idFeira?: number;
  idConsignacao?: number;
  desconto?: number;
  itens: ItemVendaInput[];
  pagamentos: PagamentoVendaInput[];
}
@Entity('venda')
@Check('ck_venda_desconto_nao_negativo', '"desconto" >= 0')
@Check('ck_venda_valor_total_nao_negativo', '"valor_total" >= 0')
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

  @Column({ type: 'integer', default: 0 })
  desconto!: number;

  valorLiquido?: number;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_venda_usuario_inclusao',
  })
  usuarioInclusao!: User;

  @Column({ type: 'integer', name: 'id_feira', nullable: true })
  idFeira?: number;

  @ManyToOne(() => Feira, (feira) => feira.vendas, { nullable: true })
  @JoinColumn({
    name: 'id_feira',
    foreignKeyConstraintName: 'fk_venda_feira',
  })
  feira?: Feira;

  @Column({ type: 'integer', name: 'id_consignacao', nullable: true })
  idConsignacao?: number;

  @ManyToOne(() => Consignacao, { nullable: true })
  @JoinColumn({
    name: 'id_consignacao',
    foreignKeyConstraintName: 'fk_venda_consignacao',
  })
  consignacao?: Consignacao;

  @OneToMany(() => ItemVenda, (itemVenda) => itemVenda.venda, {
    cascade: true,
  })
  itens!: ItemVenda[];

  @OneToMany(() => PagamentoVenda, (pagamento) => pagamento.venda, {
    cascade: true,
  })
  pagamentos!: PagamentoVenda[];

  constructor() {}

  static criar(inserirVendaInput: InserirVendaInput): Venda {
    const venda = new Venda();
    venda.dataInclusao = new Date();
    venda.atualizar(inserirVendaInput);
    return venda;
  }

  atualizar(inserirVendaInput: InserirVendaInput): void {
    this.tipo = inserirVendaInput.tipo;
    this.idFeira = inserirVendaInput.idFeira;
    this.idConsignacao = inserirVendaInput.idConsignacao;
    this.feira = undefined;
    this.consignacao = undefined;
    this.desconto = inserirVendaInput.desconto ?? 0;
    this.itens = inserirVendaInput.itens.map((item) => ItemVenda.criar(item));

    this.calcularValorTotal();
    this.pagamentos = inserirVendaInput.pagamentos.map((pagamento) =>
      PagamentoVenda.criar(pagamento),
    );
    this.validarPagamentos();
  }

  calcularValorLiquido(): number {
    const totalTaxas = (this.pagamentos ?? []).reduce(
      (total, pagamento) => total + (pagamento.valorTaxa ?? 0),
      0,
    );
    const totalImpostos = (this.pagamentos ?? []).reduce(
      (total, pagamento) => total + (pagamento.valorImposto ?? 0),
      0,
    );

    return this.valorTotal - totalTaxas - totalImpostos;
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

  private validarPagamentos(): void {
    const totalPagamentos = this.pagamentos.reduce(
      (total, pagamento) => total + pagamento.valor,
      0,
    );

    if (totalPagamentos !== this.valorTotal) {
      throw new BadRequestException(
        'A soma dos pagamentos deve ser igual ao valor total da venda.',
      );
    }
  }
}
