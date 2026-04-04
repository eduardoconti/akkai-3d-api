import { MovimentacaoEstoque, Produto } from '@produto/entities';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Venda } from '@venda/entities';

export interface ItemVendaInput {
  quantidade: number;
  valorUnitario: number;
  brinde?: boolean;
  idProduto?: number;
  nomeProduto: string;
}

@Entity('item_venda')
@Unique('uk_item_venda_venda_produto_brinde', [
  'idVenda',
  'idProduto',
  'brinde',
])
@Check('ck_item_venda_quantidade_positiva', '"quantidade" > 0')
@Check('ck_item_venda_valor_unitario_nao_negativo', '"valor_unitario" >= 0')
@Check(
  'ck_item_venda_valor_total_consistente',
  '"valor_total" = ("quantidade" * "valor_unitario")',
)
export class ItemVenda {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_item_venda',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_venda' })
  idVenda!: number;

  @Column({ type: 'integer', name: 'id_produto', nullable: true })
  idProduto?: number;

  @Column({ type: 'varchar', name: 'nome_produto', length: 120 })
  nomeProduto!: string;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'integer', name: 'valor_unitario' })
  valorUnitario!: number;

  @Column({ type: 'integer', name: 'valor_total' })
  valorTotal!: number;

  @Column({ type: 'boolean', default: false })
  brinde!: boolean;

  @ManyToOne(() => Venda, (venda) => venda.itens)
  @JoinColumn({
    name: 'id_venda',
    foreignKeyConstraintName: 'fk_item_venda_venda',
  })
  venda!: Venda;

  @ManyToOne(() => Produto, (produto) => produto.itensVenda, { nullable: true })
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_venda_produto',
  })
  produto?: Produto;

  @OneToMany(() => MovimentacaoEstoque, (movimentacao) => movimentacao.itemVenda)
  movimentacoesEstoque!: MovimentacaoEstoque[];

  constructor() {}

  static criar(inserirItemVendaInput: ItemVendaInput): ItemVenda {
    const itemVenda = new ItemVenda();
    itemVenda.idProduto = inserirItemVendaInput.idProduto;
    itemVenda.nomeProduto = inserirItemVendaInput.nomeProduto;
    itemVenda.quantidade = inserirItemVendaInput.quantidade;
    itemVenda.brinde = inserirItemVendaInput.brinde ?? false;
    itemVenda.valorUnitario = itemVenda.brinde
      ? 0
      : inserirItemVendaInput.valorUnitario;

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
    this.valorTotal = this.quantidade * this.valorUnitario;
  }
}
