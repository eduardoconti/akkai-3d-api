import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from '@produto/entities';

@Entity()
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ name: 'id_produto' })
  idProduto!: number;
  @Column()
  quantidade!: number;
  @Column()
  tipo!: 'E' | 'S';
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;
  @Column()
  origem!: 'COMPRA' | 'VENDA' | 'AJUSTE' | 'PERDA' | 'PRODUCAO';

  @ManyToOne(() => Produto, (produto) => produto.movimentacoesEstoque)
  @JoinColumn({ name: 'id_produto' })
  produto!: Produto;

  constructor() {}
}
