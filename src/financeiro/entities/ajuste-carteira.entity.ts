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

export enum TipoAjusteCarteira {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO',
}

export interface AjusteCarteiraInput {
  idCarteira: number;
  tipo: TipoAjusteCarteira;
  valor: number;
  dataAjuste: string;
  motivo: string;
  observacao?: string;
}

export interface CriarAjusteCarteiraInput extends AjusteCarteiraInput {
  idUsuarioInclusao: number;
}

@Entity('ajuste_carteira')
@Check('ck_ajuste_carteira_valor_positivo', '"valor" > 0')
@Index('idx_ajuste_carteira_id_carteira', ['idCarteira'])
@Index('idx_ajuste_carteira_data_ajuste', ['dataAjuste'])
export class AjusteCarteira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_ajuste_carteira',
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
    name: 'data_ajuste',
  })
  dataAjuste!: Date;

  @Column({ type: 'integer', name: 'id_carteira' })
  idCarteira!: number;

  @ManyToOne(() => Carteira, (carteira) => carteira.ajustes, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_carteira',
    foreignKeyConstraintName: 'fk_ajuste_carteira_carteira',
  })
  carteira!: Carteira;

  @Column({
    type: 'enum',
    enum: TipoAjusteCarteira,
    enumName: 'tipo_ajuste_carteira_enum',
  })
  tipo!: TipoAjusteCarteira;

  @Column({ type: 'integer' })
  valor!: number;

  @Column({
    type: 'varchar',
    length: 120,
  })
  motivo!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao?: string;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_ajuste_carteira_usuario_inclusao',
  })
  usuarioInclusao!: User;

  static criar(input: CriarAjusteCarteiraInput): AjusteCarteira {
    const ajuste = new AjusteCarteira();
    ajuste.idUsuarioInclusao = input.idUsuarioInclusao;
    ajuste.idCarteira = input.idCarteira;
    ajuste.tipo = input.tipo;
    ajuste.valor = input.valor;
    ajuste.dataAjuste = new Date(input.dataAjuste);
    ajuste.motivo = input.motivo.trim();
    ajuste.observacao = input.observacao?.trim();
    return ajuste;
  }
}
