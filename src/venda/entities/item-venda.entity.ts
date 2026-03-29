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
  idProduto: number;
}

@Entity()
@Unique('uk_venda_produto', ['idVenda', 'idProduto'])
@Check('chk_quantidade', 'quantidade > 0')
@Check('chk_valor_unitario', '"valor_unitario" >= 0')
@Check('chk_desconto', 'desconto >= 0')
export class ItemVenda {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_venda' })
  idVenda!: number;

  @Column({ name: 'id_produto' })
  idProduto!: number;

  @Column()
  quantidade!: number;

  @Column({ name: 'valor_unitario' })
  valorUnitario!: number;

  @Column({ name: 'valor_total' })
  valorTotal!: number;

  @Column({ default: 0 })
  desconto!: number;

  @ManyToOne(() => Venda, (venda) => venda.itens)
  @JoinColumn({
    name: 'id_venda',
    foreignKeyConstraintName: 'fk_item_venda_venda',
  })
  venda!: Venda;

  @ManyToOne(() => Produto, (produto) => produto.itensVenda)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_venda_produto',
  })
  produto!: Produto;

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
