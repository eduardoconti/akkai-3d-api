import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { Carteira } from './carteira.entity';

export interface TransferenciaCarteiraInput {
  idCarteiraOrigem: number;
  idCarteiraDestino: number;
  valor: number;
  dataTransferencia: string;
}

export interface CriarTransferenciaCarteiraInput
  extends TransferenciaCarteiraInput {
  idUsuarioInclusao: number;
}

@Entity('transferencia_carteira')
@Check(
  'ck_transferencia_carteira_carteiras_diferentes',
  '"id_carteira_origem" <> "id_carteira_destino"',
)
@Check('ck_transferencia_carteira_valor_positivo', '"valor" > 0')
@Index('idx_transferencia_carteira_id_carteira_origem', ['idCarteiraOrigem'])
@Index('idx_transferencia_carteira_id_carteira_destino', ['idCarteiraDestino'])
@Index('idx_transferencia_carteira_data_transferencia', ['dataTransferencia'])
export class TransferenciaCarteira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_transferencia_carteira',
  })
  id!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({
    type: 'timestamp',
    name: 'data_transferencia',
  })
  dataTransferencia!: Date;

  @Column({ type: 'integer', name: 'id_carteira_origem' })
  idCarteiraOrigem!: number;

  @ManyToOne(() => Carteira, (carteira) => carteira.transferenciasOrigem, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_carteira_origem',
    foreignKeyConstraintName: 'fk_transferencia_carteira_origem',
  })
  carteiraOrigem!: Carteira;

  @Column({ type: 'integer', name: 'id_carteira_destino' })
  idCarteiraDestino!: number;

  @ManyToOne(() => Carteira, (carteira) => carteira.transferenciasDestino, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_carteira_destino',
    foreignKeyConstraintName: 'fk_transferencia_carteira_destino',
  })
  carteiraDestino!: Carteira;

  @Column({ type: 'integer' })
  valor!: number;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_transferencia_carteira_usuario_inclusao',
  })
  usuarioInclusao!: User;

  static criar(input: CriarTransferenciaCarteiraInput): TransferenciaCarteira {
    const transferencia = new TransferenciaCarteira();
    transferencia.idUsuarioInclusao = input.idUsuarioInclusao;
    transferencia.atualizar(input);
    return transferencia;
  }

  atualizar(input: TransferenciaCarteiraInput): void {
    this.idCarteiraOrigem = input.idCarteiraOrigem;
    this.idCarteiraDestino = input.idCarteiraDestino;
    this.valor = input.valor;
    this.dataTransferencia = new Date(input.dataTransferencia);
  }
}
