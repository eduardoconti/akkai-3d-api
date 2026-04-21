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

export interface ItemCicloAssinaturaInput {
  nomeProduto: string;
  quantidade: number;
  observacao?: string;
}

@Entity('item_ciclo_assinatura')
@Unique('uk_item_ciclo_produto', ['idCiclo', 'nomeProduto'])
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

  @Column({ type: 'varchar', length: 120, name: 'nome_produto' })
  nomeProduto!: string;

  @Column({ type: 'integer' })
  quantidade!: number;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  static criar(input: ItemCicloAssinaturaInput): ItemCicloAssinatura {
    const item = new ItemCicloAssinatura();
    item.nomeProduto = input.nomeProduto;
    item.quantidade = input.quantidade;
    item.observacao = input.observacao;
    return item;
  }
}
