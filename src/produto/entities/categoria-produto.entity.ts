import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from '@produto/entities';

@Entity('categoria_produto')
@Check(
  'ck_categoria_produto_sem_auto_relacao',
  '"id_ascendente" IS NULL OR "id_ascendente" <> "id"',
)
export class CategoriaProduto {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_categoria_produto',
  })
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  nome!: string;

  @Column({ type: 'integer', nullable: true, name: 'id_ascendente' })
  idAscendente?: number;

  @ManyToOne(() => CategoriaProduto, (categoria) => categoria.filhos)
  @JoinColumn({
    name: 'id_ascendente',
    foreignKeyConstraintName: 'fk_categoria_produto_categoria_pai',
  })
  ascendente?: CategoriaProduto;

  @OneToMany(() => CategoriaProduto, (categoria) => categoria.ascendente)
  filhos!: CategoriaProduto[];

  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos!: Produto[];

  constructor() {}
}
