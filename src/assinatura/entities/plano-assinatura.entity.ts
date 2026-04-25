import { Check, Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

export interface PlanoAssinaturaInput {
  nome: string;
  descricao?: string;
  valor: number;
  ativo: boolean;
  // vitrine
  slug?: string;
  resumo?: string;
  destaque?: boolean;
  faixaEtaria?: string;
  itensInclusos?: string[];
  beneficios?: string[];
}

@Entity('plano_assinatura')
@Unique('uk_plano_assinatura_nome', ['nome'])
@Check('ck_plano_assinatura_valor_positivo', '"valor" > 0')
export class PlanoAssinatura {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_plano_assinatura' })
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Index('uk_plano_assinatura_slug', { unique: true, where: '"slug" IS NOT NULL' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resumo?: string;

  @Column({ type: 'integer' })
  valor!: number;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({ type: 'boolean', default: false })
  destaque!: boolean;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'faixa_etaria' })
  faixaEtaria?: string;

  @Column({ type: 'simple-json', nullable: true, name: 'itens_inclusos' })
  itensInclusos?: string[];

  @Column({ type: 'simple-json', nullable: true })
  beneficios?: string[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_inclusao',
  })
  dataInclusao!: Date;

  static gerarSlug(nome: string): string {
    return nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static criar(input: PlanoAssinaturaInput): PlanoAssinatura {
    const plano = new PlanoAssinatura();
    plano.dataInclusao = new Date();
    plano.atualizar(input);
    if (!plano.slug) plano.slug = PlanoAssinatura.gerarSlug(plano.nome);
    return plano;
  }

  atualizar(input: PlanoAssinaturaInput): void {
    this.nome = input.nome;
    this.descricao = input.descricao;
    this.valor = input.valor;
    this.ativo = input.ativo;
    this.slug = input.slug ?? this.slug ?? PlanoAssinatura.gerarSlug(input.nome);
    this.resumo = input.resumo ?? this.resumo;
    this.destaque = input.destaque ?? this.destaque ?? false;
    this.faixaEtaria = input.faixaEtaria ?? this.faixaEtaria;
    this.itensInclusos = input.itensInclusos ?? this.itensInclusos;
    this.beneficios = input.beneficios ?? this.beneficios;
  }
}
