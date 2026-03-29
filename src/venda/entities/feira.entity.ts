import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Venda } from './venda.entity';

@Entity('feira')
@Unique('uk_feira_nome', ['nome'])
export class Feira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_feira',
  })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  local?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao?: string;

  @Column({ type: 'boolean', default: true })
  ativa!: boolean;

  @OneToMany(() => Venda, (venda) => venda.feira)
  vendas!: Venda[];
}
