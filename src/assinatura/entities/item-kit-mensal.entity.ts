import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { KitMensal } from './kit-mensal.entity';
import { Produto } from '@produto/entities';

export interface ItemKitMensalInput {
  idProduto: number;
  quantidade: number;
  observacao?: string;
  nomeProduto?: string;
}

@Entity('item_kit_mensal')
@Unique('uk_item_kit_mensal_produto', ['idKit', 'idProduto'])
@Check('ck_item_kit_mensal_quantidade_positiva', '"quantidade" > 0')
export class ItemKitMensal {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_item_kit_mensal' })
  id!: number;

  @Column({ type: 'integer', name: 'id_kit' })
  idKit!: number;

  @ManyToOne(() => KitMensal, (kit) => kit.itens)
  @JoinColumn({
    name: 'id_kit',
    foreignKeyConstraintName: 'fk_item_kit_mensal_kit',
  })
  kit!: KitMensal;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @ManyToOne(() => Produto)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_kit_mensal_produto',
  })
  produto!: Produto;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  get nomeProduto(): string | undefined {
    return this.produto?.nome;
  }

  static criar(input: ItemKitMensalInput): ItemKitMensal {
    const item = new ItemKitMensal();
    item.idProduto = input.idProduto;
    item.produto = undefined as unknown as Produto;
    item.quantidade = input.quantidade;
    item.observacao = input.observacao;
    return item;
  }
}
