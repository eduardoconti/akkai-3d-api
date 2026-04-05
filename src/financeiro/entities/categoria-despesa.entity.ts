import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Despesa } from './despesa.entity';

@Entity('categoria_despesa')
@Unique('uk_categoria_despesa_nome', ['nome'])
export class CategoriaDespesa {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_categoria_despesa',
  })
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  nome!: string;

  @OneToMany(() => Despesa, (despesa) => despesa.categoria)
  despesas!: Despesa[];

  constructor() {}
}
