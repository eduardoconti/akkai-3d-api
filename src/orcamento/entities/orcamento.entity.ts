import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orcamento')
@Index('idx_orcamento_data_inclusao', ['dataInclusao'])
export class Orcamento {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_orcamento',
  })
  id!: number;

  @Column({ type: 'varchar', name: 'nome_cliente', length: 120 })
  nomeCliente!: string;

  @Column({ type: 'varchar', name: 'telefone_cliente', length: 30 })
  telefoneCliente!: string;

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
}
