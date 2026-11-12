import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Orcamento } from './orcamento.entity';

export interface ItemOrcamentoInput {
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
}

/**
 * Produto do catálogo informado em um orçamento. Guarda só o produto e a
 * quantidade: o preço vem do catálogo (ou da feira) no momento da venda.
 * `idProduto` não tem relação TypeORM para não acoplar o orçamento à entidade
 * de produto; a chave estrangeira existe apenas na migration.
 */
@Entity('item_orcamento')
@Unique('uk_item_orcamento_orcamento_produto', ['idOrcamento', 'idProduto'])
@Check('ck_item_orcamento_quantidade_positiva', '"quantidade" > 0')
@Index('idx_item_orcamento_id_orcamento', ['idOrcamento'])
@Index('idx_item_orcamento_id_produto', ['idProduto'])
export class ItemOrcamento {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_item_orcamento' })
  id!: number;

  @Column({ type: 'integer', name: 'id_orcamento' })
  idOrcamento!: number;

  @ManyToOne(() => Orcamento, (orcamento) => orcamento.itens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_orcamento',
    foreignKeyConstraintName: 'fk_item_orcamento_orcamento',
  })
  orcamento!: Orcamento;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @Column({ type: 'varchar', name: 'nome_produto', length: 120 })
  nomeProduto!: string;

  @Column({ type: 'integer' })
  quantidade!: number;

  static criar(input: ItemOrcamentoInput): ItemOrcamento {
    const item = new ItemOrcamento();
    item.idProduto = input.idProduto;
    item.nomeProduto = input.nomeProduto;
    item.quantidade = input.quantidade;
    return item;
  }
}
