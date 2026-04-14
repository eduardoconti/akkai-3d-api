import { ItemVenda } from '@venda/entities';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { CategoriaProduto, MovimentacaoEstoque } from '@produto/entities';

export interface ProdutoInput {
  nome: string;
  codigo: string;
  descricao?: string;
  estoqueMinimo?: number;
  idCategoria: number;
  valor: number;
}

export interface CriarProdutoInput extends ProdutoInput {
  idUsuarioInclusao: number;
}

@Entity('produto')
@Unique('uk_produto_codigo', ['codigo'])
@Check('ck_produto_valor_nao_negativo', '"valor" >= 0')
@Check(
  'ck_produto_estoque_minimo_nao_negativo',
  '"estoque_minimo" IS NULL OR "estoque_minimo" >= 0',
)
@Index('idx_produto_id_categoria', ['idCategoria'])
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

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_produto_usuario_inclusao',
  })
  usuarioInclusao!: User;

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

  static criar(input: CriarProdutoInput): Produto {
    const produto = new Produto();
    produto.idUsuarioInclusao = input.idUsuarioInclusao;
    produto.atualizar(input);
    return produto;
  }

  atualizar(input: ProdutoInput): void {
    this.nome = input.nome;
    this.codigo = input.codigo;
    this.descricao = input.descricao;
    this.estoqueMinimo = input.estoqueMinimo;
    this.idCategoria = input.idCategoria;
    this.valor = input.valor;
  }
}
