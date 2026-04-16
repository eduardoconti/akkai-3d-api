import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feira } from '@venda/entities';

export enum StatusOrcamento {
  PENDENTE = 'PENDENTE',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  APROVADO = 'APROVADO',
  PRODUZIDO = 'PRODUZIDO',
  FINALIZADO = 'FINALIZADO',
}

export enum TipoOrcamento {
  FEIRA = 'FEIRA',
  LOJA = 'LOJA',
  ONLINE = 'ONLINE',
}

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

  @Column({ type: 'integer', nullable: true })
  quantidade?: number;
}
