import { Produto } from '@produto/entities';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Feira } from './feira.entity';

export interface PrecoProdutoFeiraInput {
  idFeira: number;
  idProduto: number;
  valor: number;
}

@Entity('preco_produto_feira')
@Unique('uk_preco_produto_feira_feira_produto', ['idFeira', 'idProduto'])
@Check('ck_preco_produto_feira_valor_minimo', '"valor" >= 50')
@Index('idx_preco_produto_feira_id_feira', ['idFeira'])
@Index('idx_preco_produto_feira_id_produto', ['idProduto'])
export class PrecoProdutoFeira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_preco_produto_feira',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_feira' })
  idFeira!: number;

  @Column({ type: 'integer', name: 'id_produto' })
  idProduto!: number;

  @Column({ type: 'integer' })
  valor!: number;

  @ManyToOne(() => Feira, (feira) => feira.precosProdutos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_feira',
    foreignKeyConstraintName: 'fk_preco_produto_feira_feira',
  })
  feira!: Feira;

  @ManyToOne(() => Produto, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_produto',
    foreignKeyConstraintName: 'fk_preco_produto_feira_produto',
  })
  produto!: Produto;

  constructor() {}

  static criar(input: PrecoProdutoFeiraInput): PrecoProdutoFeira {
    const preco = new PrecoProdutoFeira();
    preco.idFeira = input.idFeira;
    preco.idProduto = input.idProduto;
    preco.valor = input.valor;
    return preco;
  }

  atualizarValor(valor: number): void {
    this.valor = valor;
  }
}
