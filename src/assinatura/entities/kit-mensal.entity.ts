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
  itens?: ItemKitMensalInput[];
  // vitrine
  titulo?: string;
  descricao?: string;
  chamada?: string;
  ativo?: boolean;
  itensVitrine?: string[];
}

@Entity('kit_mensal')
@Unique('uk_kit_mensal_plano_mes_ano', ['idPlano', 'mesReferencia', 'anoReferencia'])
@Index('idx_kit_mensal_id_plano', ['idPlano'])
export class KitMensal {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_kit_mensal' })
  id!: number;

  @Column({ type: 'integer', name: 'id_plano' })
  idPlano!: number;

  @ManyToOne(() => PlanoAssinatura)
  @JoinColumn({ name: 'id_plano', foreignKeyConstraintName: 'fk_kit_mensal_plano_assinatura' })
  plano!: PlanoAssinatura;

  @Column({ type: 'integer', name: 'mes_referencia' })
  mesReferencia!: number;

  @Column({ type: 'integer', name: 'ano_referencia' })
  anoReferencia!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  titulo?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  chamada?: string;

  @Column({ type: 'boolean', default: false })
  ativo!: boolean;

  @Column({ type: 'simple-json', nullable: true, name: 'itens_vitrine' })
  itensVitrine?: string[];

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
    kit.idPlano = input.idPlano;
    kit.plano = undefined as unknown as PlanoAssinatura;
    kit.mesReferencia = input.mesReferencia;
    kit.anoReferencia = input.anoReferencia;
    kit.itens = (input.itens ?? []).map((item) => ItemKitMensal.criar(item));
    kit.atualizarVitrine(input);
    return kit;
  }

  atualizarVitrine(input: Pick<KitMensalInput, 'titulo' | 'descricao' | 'chamada' | 'ativo' | 'itensVitrine'>): void {
    if (input.titulo !== undefined) this.titulo = input.titulo;
    if (input.descricao !== undefined) this.descricao = input.descricao;
    if (input.chamada !== undefined) this.chamada = input.chamada;
    if (input.ativo !== undefined) this.ativo = input.ativo;
    if (input.itensVitrine !== undefined) this.itensVitrine = input.itensVitrine;
  }
}
