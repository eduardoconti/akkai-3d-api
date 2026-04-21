import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CicloAssinatura } from './ciclo-assinatura.entity';
import { Produto } from '@produto/entities';

export interface ItemCicloAssinaturaInput {
  idProduto: number;
  quantidade: number;
  observacao?: string;
  nomeProduto?: string;
}

@Entity('item_ciclo_assinatura')
@Unique('uk_item_ciclo_produto', ['idCiclo', 'idProduto'])
@Check('ck_item_ciclo_quantidade_positiva', '"quantidade" > 0')
export class ItemCicloAssinatura {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_item_ciclo_assinatura',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_ciclo' })
  idCiclo!: number;

  @ManyToOne(() => CicloAssinatura, (ciclo) => ciclo.itens)
  @JoinColumn({
    name: 'id_ciclo',
    foreignKeyConstraintName: 'fk_item_ciclo_assinatura_ciclo',
  })
  ciclo!: CicloAssinatura;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @ManyToOne(() => Produto)
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_item_ciclo_assinatura_produto',
  })
  produto!: Produto;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  get nomeProduto(): string | undefined {
    return this.produto?.nome;
  }

  static criar(input: ItemCicloAssinaturaInput): ItemCicloAssinatura {
    const item = new ItemCicloAssinatura();
    item.idProduto = input.idProduto;
    item.produto = undefined as unknown as Produto;
    item.quantidade = input.quantidade;
    item.observacao = input.observacao;
    return item;
  }
}
