import { BadRequestException } from '@nestjs/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feira } from '@venda/entities/feira.entity';
import {
  CanalAtendimentoOrcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/enums';
import { ItemOrcamento, ItemOrcamentoInput } from './item-orcamento.entity';

@Entity('orcamento')
@Index('idx_orcamento_data_inclusao', ['dataInclusao'])
@Index('idx_orcamento_id_feira', ['idFeira'])
export class Orcamento {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_orcamento',
  })
  id!: number;

  @Column({ type: 'varchar', name: 'nome_cliente', length: 120 })
  nomeCliente!: string;

  @Column({
    type: 'varchar',
    name: 'telefone_cliente',
    length: 30,
    nullable: true,
  })
  telefoneCliente?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  descricao?: string;

  @Column({ type: 'varchar', name: 'link_stl', length: 500, nullable: true })
  linkSTL?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({
    type: 'enum',
    enum: StatusOrcamento,
    enumName: 'status_orcamento_enum',
    default: StatusOrcamento.PENDENTE,
  })
  status!: StatusOrcamento;

  @Column({
    type: 'enum',
    enum: TipoOrcamento,
    enumName: 'tipo_orcamento_enum',
    default: TipoOrcamento.LOJA,
  })
  tipo!: TipoOrcamento;

  @Column({
    type: 'enum',
    enum: CanalAtendimentoOrcamento,
    enumName: 'canal_atendimento_orcamento_enum',
    name: 'canal_atendimento',
    nullable: true,
  })
  canalAtendimento?: CanalAtendimentoOrcamento;

  @Column({ type: 'integer', name: 'id_feira', nullable: true })
  idFeira?: number;

  @ManyToOne(() => Feira, { nullable: true })
  @JoinColumn({
    name: 'id_feira',
    foreignKeyConstraintName: 'fk_orcamento_feira',
  })
  feira?: Feira | null;

  @Column({ type: 'integer', nullable: true })
  valor?: number;

  /** Produtos do catálogo informados no orçamento (carregados sob demanda). */
  @OneToMany(() => ItemOrcamento, (item) => item.orcamento, { cascade: true })
  itens?: ItemOrcamento[];

  /** Substitui os produtos do orçamento; orçamento finalizado não pode mudar. */
  definirItens(itens: ItemOrcamentoInput[]): void {
    if (this.status === StatusOrcamento.FINALIZADO) {
      throw new BadRequestException(
        `Orçamento #${this.id} já está finalizado e não pode ter os produtos alterados.`,
      );
    }

    const idsProdutos = itens.map((item) => item.idProduto);
    if (new Set(idsProdutos).size !== idsProdutos.length) {
      throw new BadRequestException(
        'O mesmo produto não pode ser informado mais de uma vez no orçamento.',
      );
    }

    this.itens = itens.map((item) => ItemOrcamento.criar(item));
  }

  finalizar(): void {
    if (this.status === StatusOrcamento.FINALIZADO) {
      throw new BadRequestException(
        `Orçamento #${this.id} já está finalizado.`,
      );
    }

    this.status = StatusOrcamento.FINALIZADO;
  }
}
