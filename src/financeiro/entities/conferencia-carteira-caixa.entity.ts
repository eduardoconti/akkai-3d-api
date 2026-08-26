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
import { Carteira } from './carteira.entity';
import { Caixa } from './caixa.entity';

@Entity('conferencia_carteira_caixa')
@Unique('uk_conferencia_caixa_carteira', ['idCaixa', 'idCarteira'])
@Index('idx_conferencia_id_carteira', ['idCarteira'])
@Check('ck_conferencia_valor_abertura_nao_negativo', '"valor_abertura" >= 0')
export class ConferenciaCarteiraCaixa {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_conferencia_carteira_caixa',
  })
  id!: number;
  @Column({ type: 'integer', name: 'id_caixa' }) idCaixa!: number;
  @ManyToOne(() => Caixa, (caixa) => caixa.conferencias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'id_caixa',
    foreignKeyConstraintName: 'fk_conferencia_caixa',
  })
  caixa!: Caixa;
  @Column({ type: 'integer', name: 'id_carteira' }) idCarteira!: number;
  @ManyToOne(() => Carteira, { onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_conferencia_carteira',
  })
  carteira!: Carteira;
  @Column({ type: 'integer', name: 'valor_abertura' }) valorAbertura!: number;
  @Column({ type: 'integer', name: 'total_entradas', nullable: true })
  totalEntradas?: number | null;
  @Column({
    type: 'integer',
    name: 'valor_esperado_fechamento',
    nullable: true,
  })
  valorEsperadoFechamento?: number | null;
  @Column({
    type: 'integer',
    name: 'valor_informado_fechamento',
    nullable: true,
  })
  valorInformadoFechamento?: number | null;
  @Column({ type: 'integer', nullable: true }) diferenca?: number | null;
}
