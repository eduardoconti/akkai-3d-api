import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from '@produto/entities/produto.entity';

@Entity()
export class CategoriaProduto {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string;
  @Column({ nullable: true, name: 'id_ascendente' })
  idAscendente?: number;

  @ManyToOne(() => CategoriaProduto, (categoria) => categoria.filhos)
  @JoinColumn({ name: 'id_ascendente' })
  ascendente: CategoriaProduto;

  @OneToMany(() => CategoriaProduto, (categoria) => categoria.ascendente)
  filhos: CategoriaProduto[];

  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos: Produto[];

  constructor() {}
}
