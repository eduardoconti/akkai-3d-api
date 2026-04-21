import { Injectable } from '@nestjs/common';
import {
  CicloAssinatura,
  ItemCicloAssinaturaInput,
  StatusCiclo,
} from '@assinatura/entities';
import { CicloService } from '@assinatura/services';

export interface AlterarCicloInput {
  id: number;
  status: StatusCiclo;
  codigoRastreio?: string;
  dataEnvio?: Date;
  observacao?: string;
  itens: ItemCicloAssinaturaInput[];
}

@Injectable()
export class AlterarCicloUseCase {
  constructor(private readonly cicloService: CicloService) {}

  async execute(input: AlterarCicloInput): Promise<CicloAssinatura> {
    const ciclo = await this.cicloService.garantirCicloPorId(input.id);
    ciclo.atualizar({
      idAssinante: ciclo.idAssinante,
      mesReferencia: ciclo.mesReferencia,
      anoReferencia: ciclo.anoReferencia,
      status: input.status,
      codigoRastreio: input.codigoRastreio,
      dataEnvio: input.dataEnvio,
      observacao: input.observacao,
      itens: input.itens,
    });
    return this.cicloService.salvarCiclo(ciclo);
  }
}
