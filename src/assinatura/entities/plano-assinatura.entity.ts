import { Check, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export interface PlanoAssinaturaInput {
  nome: string;
  descricao?: string;
  valor: number;
  ativo: boolean;
}

@Entity('plano_assinatura')
@Unique('uk_plano_assinatura_nome', ['nome'])
@Check('ck_plano_assinatura_valor_positivo', '"valor" > 0')
export class PlanoAssinatura {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_plano_assinatura' })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'integer' })
  valor!: number;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  static criar(input: PlanoAssinaturaInput): PlanoAssinatura {
    const plano = new PlanoAssinatura();
    plano.dataInclusao = new Date();
    plano.atualizar(input);
    return plano;
  }

  atualizar(input: PlanoAssinaturaInput): void {
    this.nome = input.nome;
    this.descricao = input.descricao;
    this.valor = input.valor;
    this.ativo = input.ativo;
  }
}
