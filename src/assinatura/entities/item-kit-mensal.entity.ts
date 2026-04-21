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

export interface ItemKitMensalInput {
  nomeProduto: string;
  quantidade: number;
  observacao?: string;
}

@Entity('item_kit_mensal')
@Unique('uk_item_kit_mensal_produto', ['idKit', 'nomeProduto'])
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

  @Column({ type: 'varchar', length: 120, name: 'nome_produto' })
  nomeProduto!: string;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  static criar(input: ItemKitMensalInput): ItemKitMensal {
    const item = new ItemKitMensal();
    item.nomeProduto = input.nomeProduto;
    item.quantidade = input.quantidade;
    item.observacao = input.observacao;
    return item;
  }
}
