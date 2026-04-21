import { Injectable } from '@nestjs/common';
import {
  AssinanteService,
  CicloService,
  KitMensalService,
} from '@assinatura/services';

export interface GerarCiclosResult {
  criados: number;
  ignorados: number;
}

@Injectable()
export class GerarCiclosMensaisUseCase {
  constructor(
    private readonly kitMensalService: KitMensalService,
    private readonly assinanteService: AssinanteService,
    private readonly cicloService: CicloService,
  ) {}

  async execute(idKit: number): Promise<GerarCiclosResult> {
    const kit = await this.kitMensalService.garantirKitPorId(idKit);
    const assinantes = await this.assinanteService.listarAssinantesPorPlano(
      kit.idPlano,
    );

    if (assinantes.length === 0) {
      return { criados: 0, ignorados: 0 };
    }

    return this.cicloService.inserirCiclosEmLote(
      assinantes.map((a) => a.id),
      kit.mesReferencia,
      kit.anoReferencia,
      kit.itens.map((item) => ({
        nomeProduto: item.nomeProduto,
        quantidade: item.quantidade,
        observacao: item.observacao,
      })),
    );
  }
}
