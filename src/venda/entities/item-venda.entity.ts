import { Produto } from '@produto/entities';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Venda } from '@venda/entities';

export interface ItemVendaInput {
  quantidade: number;
  valorUnitario: number;
  desconto?: number;
  idProduto?: number;
  nomeProduto: string;
}

@Entity('item_venda')
@Unique('uk_item_venda_venda_produto', ['idVenda', 'idProduto'])
@Check('ck_item_venda_quantidade_positiva', '"quantidade" > 0')
@Check('ck_item_venda_valor_unitario_nao_negativo', '"valor_unitario" >= 0')
@Check('ck_item_venda_desconto_nao_negativo', '"desconto" >= 0')
@Check(
  'ck_item_venda_desconto_nao_excede_bruto',
  '"desconto" <= ("quantidade" * "valor_unitario")',
)
@Check(
  'ck_item_venda_valor_total_consistente',
  '"valor_total" = (("quantidade" * "valor_unitario") - "desconto")',
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

  @Column({ type: 'integer', default: 0 })
  desconto!: number;

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

  constructor() {}

  static criar(inserirItemVendaInput: ItemVendaInput): ItemVenda {
    const itemVenda = new ItemVenda();
    itemVenda.idProduto = inserirItemVendaInput.idProduto;
    itemVenda.nomeProduto = inserirItemVendaInput.nomeProduto;
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
