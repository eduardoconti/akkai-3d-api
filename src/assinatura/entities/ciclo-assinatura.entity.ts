import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Assinante } from './assinante.entity';
import { StatusCiclo } from '@assinatura/enums';
import {
  ItemCicloAssinatura,
  ItemCicloAssinaturaInput,
} from './item-ciclo-assinatura.entity';

export interface CicloAssinaturaInput {
  idAssinante: number;
  mesReferencia: number;
  anoReferencia: number;
  status: StatusCiclo;
  codigoRastreio?: string;
  dataEnvio?: Date;
  observacao?: string;
  itens: ItemCicloAssinaturaInput[];
}

@Entity('ciclo_assinatura')
@Unique('uk_ciclo_assinante_mes_ano', [
  'idAssinante',
  'mesReferencia',
  'anoReferencia',
])
@Index('idx_ciclo_assinatura_id_assinante', ['idAssinante'])
@Index('idx_ciclo_assinatura_status', ['status'])
export class CicloAssinatura {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_ciclo_assinatura' })
  id!: number;

  @Column({ type: 'integer', name: 'id_assinante' })
  idAssinante!: number;

  @ManyToOne(() => Assinante)
  @JoinColumn({
    name: 'id_assinante',
    foreignKeyConstraintName: 'fk_ciclo_assinatura_assinante',
  })
  assinante!: Assinante;

  @Column({ type: 'integer', name: 'mes_referencia' })
  mesReferencia!: number;

  @Column({ type: 'integer', name: 'ano_referencia' })
  anoReferencia!: number;

  @Column({
    type: 'enum',
    enum: StatusCiclo,
    enumName: 'status_ciclo_enum',
    default: StatusCiclo.PENDENTE,
  })
  status!: StatusCiclo;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
    name: 'codigo_rastreio',
  })
  codigoRastreio?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'data_envio' })
  dataEnvio?: Date;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @OneToMany(() => ItemCicloAssinatura, (item) => item.ciclo, { cascade: true })
  itens!: ItemCicloAssinatura[];

  static criar(input: CicloAssinaturaInput): CicloAssinatura {
    const ciclo = new CicloAssinatura();
    ciclo.dataInclusao = new Date();
    ciclo.atualizar(input);
    return ciclo;
  }

  atualizar(input: CicloAssinaturaInput): void {
    this.idAssinante = input.idAssinante;
    this.assinante = undefined as unknown as Assinante;
    this.mesReferencia = input.mesReferencia;
    this.anoReferencia = input.anoReferencia;
    this.status = input.status;
    this.codigoRastreio = input.codigoRastreio;
    this.dataEnvio = input.dataEnvio;
    this.observacao = input.observacao;
    this.itens = input.itens.map((item) => ItemCicloAssinatura.criar(item));
  }
}
