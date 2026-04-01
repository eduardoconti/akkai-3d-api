import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Venda } from '@venda/entities/venda.entity';
import { Despesa } from './despesa.entity';

@Entity('carteira')
export class Carteira {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk_carteira',
  })
  id!: number;

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
  })
  nome!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  ativa!: boolean;

  @OneToMany(() => Venda, (venda) => venda.carteira)
  vendas!: Venda[];

  @OneToMany(() => Despesa, (despesa) => despesa.carteira)
  despesas!: Despesa[];
}
