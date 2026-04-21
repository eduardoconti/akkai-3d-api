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
import { PlanoAssinatura } from './plano-assinatura.entity';
import { ItemKitMensal, ItemKitMensalInput } from './item-kit-mensal.entity';

export interface KitMensalInput {
  idPlano: number;
  mesReferencia: number;
  anoReferencia: number;
  itens: ItemKitMensalInput[];
}

@Entity('kit_mensal')
@Unique('uk_kit_mensal_plano_mes_ano', [
  'idPlano',
  'mesReferencia',
  'anoReferencia',
])
@Index('idx_kit_mensal_id_plano', ['idPlano'])
export class KitMensal {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_kit_mensal' })
  id!: number;

  @Column({ type: 'integer', name: 'id_plano' })
  idPlano!: number;

  @ManyToOne(() => PlanoAssinatura)
  @JoinColumn({
    name: 'id_plano',
    foreignKeyConstraintName: 'fk_kit_mensal_plano_assinatura',
  })
  plano!: PlanoAssinatura;

  @Column({ type: 'integer', name: 'mes_referencia' })
  mesReferencia!: number;

  @Column({ type: 'integer', name: 'ano_referencia' })
  anoReferencia!: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  @OneToMany(() => ItemKitMensal, (item) => item.kit, { cascade: true })
  itens!: ItemKitMensal[];

  static criar(input: KitMensalInput): KitMensal {
    const kit = new KitMensal();
    kit.dataInclusao = new Date();
    kit.atualizar(input);
    return kit;
  }

  atualizar(input: KitMensalInput): void {
    this.idPlano = input.idPlano;
    this.plano = undefined as unknown as PlanoAssinatura;
    this.mesReferencia = input.mesReferencia;
    this.anoReferencia = input.anoReferencia;
    this.itens = input.itens.map((item) => ItemKitMensal.criar(item));
  }
}
