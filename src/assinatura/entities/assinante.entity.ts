import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanoAssinatura } from './plano-assinatura.entity';
import { StatusAssinante } from '@assinatura/enums';

export interface AssinanteInput {
  nome: string;
  email?: string;
  telefone?: string;
  enderecoEntrega?: string;
  idPlano: number;
  status: StatusAssinante;
}

@Entity('assinante')
@Index('idx_assinante_id_plano', ['idPlano'])
@Index('idx_assinante_status', ['status'])
export class Assinante {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_assinante' })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'endereco_entrega',
  })
  enderecoEntrega?: string;

  @Column({
    type: 'enum',
    enum: StatusAssinante,
    enumName: 'status_assinante_enum',
    default: StatusAssinante.ATIVO,
  })
  status!: StatusAssinante;

  @Column({ type: 'integer', name: 'id_plano' })
  idPlano!: number;

  @ManyToOne(() => PlanoAssinatura)
  @JoinColumn({
    name: 'id_plano',
    foreignKeyConstraintName: 'fk_assinante_plano_assinatura',
  })
  plano!: PlanoAssinatura;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  static criar(input: AssinanteInput): Assinante {
    const assinante = new Assinante();
    assinante.dataInclusao = new Date();
    assinante.atualizar(input);
    return assinante;
  }

  atualizar(input: AssinanteInput): void {
    this.nome = input.nome;
    this.email = input.email;
    this.telefone = input.telefone;
    this.enderecoEntrega = input.enderecoEntrega;
    this.idPlano = input.idPlano;
    this.plano = undefined as unknown as PlanoAssinatura;
    this.status = input.status;
  }
}
