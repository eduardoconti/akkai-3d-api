import {
  Check,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consignacao } from './consignacao.entity';

export enum StatusRevendedor {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export interface RevendedorInput {
  nome: string;
  telefone: string;
  status?: StatusRevendedor;
}

@Entity('revendedor')
@Check('ck_revendedor_nome_nao_vazio', 'char_length(trim("nome")) > 0')
@Check('ck_revendedor_telefone_nao_vazio', 'char_length(trim("telefone")) > 0')
@Index('idx_revendedor_status', ['status'])
export class Revendedor {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_revendedor',
  })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'varchar', length: 30 })
  telefone!: string;

  @Column({
    type: 'enum',
    enum: StatusRevendedor,
    enumName: 'status_revendedor_enum',
    default: StatusRevendedor.ATIVO,
  })
  status!: StatusRevendedor;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @OneToMany(() => Consignacao, (consignacao) => consignacao.revendedor)
  consignacoes!: Consignacao[];

  static criar(input: RevendedorInput): Revendedor {
    const revendedor = new Revendedor();
    revendedor.atualizar(input);
    revendedor.status = input.status ?? StatusRevendedor.ATIVO;
    revendedor.dataInclusao = new Date();
    return revendedor;
  }

  atualizar(input: RevendedorInput): void {
    this.nome = input.nome;
    this.telefone = input.telefone;
    this.status = input.status ?? this.status ?? StatusRevendedor.ATIVO;
  }
}
