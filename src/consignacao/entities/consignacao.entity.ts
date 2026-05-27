import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { ItemConsignacao } from './item-consignacao.entity';
import { Revendedor } from './revendedor.entity';

export enum StatusConsignacao {
  ABERTA = 'ABERTA',
  FECHADA = 'FECHADA',
  CANCELADA = 'CANCELADA',
}

export interface CriarConsignacaoInput {
  idRevendedor: number;
  idUsuarioInclusao: number;
}

@Entity('consignacao')
@Index('idx_consignacao_id_revendedor', ['idRevendedor'])
@Index('idx_consignacao_status', ['status'])
export class Consignacao {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_consignacao',
  })
  id!: number;

  @Column({ type: 'integer', name: 'id_revendedor' })
  idRevendedor!: number;

  @Column({
    type: 'enum',
    enum: StatusConsignacao,
    enumName: 'status_consignacao_enum',
    default: StatusConsignacao.ABERTA,
  })
  status!: StatusConsignacao;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @Column({ type: 'integer', name: 'id_usuario_inclusao' })
  idUsuarioInclusao!: number;

  @ManyToOne(() => Revendedor, (revendedor) => revendedor.consignacoes)
  @JoinColumn({
    name: 'id_revendedor',
    foreignKeyConstraintName: 'fk_consignacao_revendedor',
  })
  revendedor!: Revendedor;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'id_usuario_inclusao',
    foreignKeyConstraintName: 'fk_consignacao_usuario_inclusao',
  })
  usuarioInclusao!: User;

  @OneToMany(() => ItemConsignacao, (item) => item.consignacao)
  itens!: ItemConsignacao[];

  static criar(input: CriarConsignacaoInput): Consignacao {
    const consignacao = new Consignacao();
    consignacao.idRevendedor = input.idRevendedor;
    consignacao.idUsuarioInclusao = input.idUsuarioInclusao;
    consignacao.status = StatusConsignacao.ABERTA;
    consignacao.dataInclusao = new Date();
    return consignacao;
  }
}
