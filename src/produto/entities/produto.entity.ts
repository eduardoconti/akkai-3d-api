import { ItemVenda } from '@venda/entities';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CategoriaProduto, MovimentacaoEstoque } from '@produto/entities';

@Entity('produto')
@Unique('uk_produto_codigo', ['codigo'])
@Check('ck_produto_valor_nao_negativo', '"valor" >= 0')
@Check(
  'ck_produto_estoque_minimo_nao_negativo',
  '"estoque_minimo" IS NULL OR "estoque_minimo" >= 0',
)
export class Produto {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_produto',
  })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'varchar', length: 40 })
  codigo!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column({ type: 'integer', nullable: true, name: 'estoque_minimo' })
  estoqueMinimo?: number;

  @Column({ type: 'integer', name: 'id_categoria' })
  idCategoria!: number;

  @Column({ type: 'integer' })
  valor!: number;

  @ManyToOne(() => CategoriaProduto, (categoria) => categoria.produtos)
  @JoinColumn({
    name: 'id_categoria',
    foreignKeyConstraintName: 'fk_produto_categoria_produto',
  })
  categoria!: CategoriaProduto;

  @OneToMany(() => MovimentacaoEstoque, (movimentacao) => movimentacao.produto)
  movimentacoesEstoque!: MovimentacaoEstoque[];

  @OneToMany(() => ItemVenda, (itemVenda) => itemVenda.produto)
  itensVenda!: ItemVenda[];

  constructor() {}
}
