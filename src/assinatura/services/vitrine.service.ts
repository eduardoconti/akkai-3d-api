import { Injectable } from '@nestjs/common';
import { PlanoService } from './plano.service';
import { KitMensalService } from './kit-mensal.service';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export interface PlanoVitrineDto {
  id: number;
  slug?: string;
  nome: string;
  descricao?: string;
  resumo?: string;
  valor: number;
  ativo: boolean;
  destaque: boolean;
  faixaEtaria?: string;
  itensInclusos: string[];
  beneficios: string[];
}

export interface KitVitrineDto {
  id: number;
  referencia: string;
  titulo?: string;
  descricao?: string;
  chamada?: string;
  itens: string[];
}

export interface VitrineDto {
  planos: PlanoVitrineDto[];
  kitMensal: KitVitrineDto | null;
}

@Injectable()
export class VitrineService {
  constructor(
    private readonly planoService: PlanoService,
    private readonly kitMensalService: KitMensalService,
  ) {}

  async montarVitrine(): Promise<VitrineDto> {
    const [planos, kitAtivo] = await Promise.all([
      this.planoService.listarPlanosAtivos(),
      this.kitMensalService.obterKitVitrineAtivo(),
    ]);

    const planosMapeados: PlanoVitrineDto[] = planos.map((p) => ({
      id: p.id,
      slug: p.slug,
      nome: p.nome,
      descricao: p.descricao,
      resumo: p.resumo,
      valor: p.valor,
      ativo: p.ativo,
      destaque: p.destaque ?? false,
      faixaEtaria: p.faixaEtaria,
      itensInclusos: p.itensInclusos ?? [],
      beneficios: p.beneficios ?? [],
    }));

    const kitMensal: KitVitrineDto | null = kitAtivo
      ? {
          id: kitAtivo.id,
          referencia: `${MESES[kitAtivo.mesReferencia - 1]} ${kitAtivo.anoReferencia}`,
          titulo: kitAtivo.titulo,
          descricao: kitAtivo.descricao,
          chamada: kitAtivo.chamada,
          itens: kitAtivo.itensVitrine ?? [],
        }
      : null;

    return { planos: planosMapeados, kitMensal };
  }
}
