import { ItemVenda } from 'src/venda/venda.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CategoriaProduto } from './categoria-produto.model';
import { MovimentacaoEstoque } from './movimentacao-estoque.model';

@Entity()
@Unique('uq_produto_codigo', ['codigo'])
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  nome: string;
  @Column()
  codigo: string;
  @Column({ nullable: true })
  descricao?: string;
  @Column({ nullable: true, name: 'estoque_minimo' })
  estoqueMinimo?: number;
  @Column({ name: 'id_categoria' })
  idCategoria: number;
  @Column()
  valor: number;

  @ManyToOne(() => CategoriaProduto, (categoria) => categoria.produtos)
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaProduto;

  @OneToMany(() => MovimentacaoEstoque, (movimentacao) => movimentacao.produto)
  movimentacoesEstoque: MovimentacaoEstoque[];

  @OneToMany(() => ItemVenda, (itemVenda) => itemVenda.produto)
  itensVenda: ItemVenda[];

  constructor() {}
}
