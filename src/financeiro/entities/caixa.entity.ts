import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusCaixa } from '@financeiro/enums';
import { ConferenciaCarteiraCaixa } from './conferencia-carteira-caixa.entity';

@Entity('caixa')
@Index('idx_caixa_id_feira_status', ['idFeira', 'status'])
export class Caixa {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_caixa' }) id!: number;
  @Column({ type: 'integer', name: 'id_feira' }) idFeira!: number;
  feira?: { id: number; nome: string; local?: string; ativa: boolean };
  @Column({ type: 'enum', enum: StatusCaixa, enumName: 'status_caixa_enum' })
  status!: StatusCaixa;
  @Column({ type: 'timestamp', name: 'data_abertura' }) dataAbertura!: Date;
  @Column({ type: 'timestamp', name: 'data_fechamento', nullable: true })
  dataFechamento?: Date | null;
  @Column({ type: 'integer', name: 'id_usuario_abertura' })
  idUsuarioAbertura!: number;
  @Column({ type: 'integer', name: 'id_usuario_fechamento', nullable: true })
  idUsuarioFechamento?: number | null;
  @Column({ type: 'varchar', length: 500, nullable: true })
  observacao?: string | null;
  @OneToMany(() => ConferenciaCarteiraCaixa, (item) => item.caixa, {
    cascade: true,
  })
  conferencias!: ConferenciaCarteiraCaixa[];
}
