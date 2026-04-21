import { Injectable } from '@nestjs/common';
import {
  CicloAssinatura,
  CicloAssinaturaInput,
  StatusCiclo,
} from '@assinatura/entities';
import { AssinanteService, CicloService } from '@assinatura/services';

@Injectable()
export class InserirCicloUseCase {
  constructor(
    private readonly cicloService: CicloService,
    private readonly assinanteService: AssinanteService,
  ) {}

  async execute(input: CicloAssinaturaInput): Promise<CicloAssinatura> {
    await this.assinanteService.garantirAssinantePorId(input.idAssinante);
    const ciclo = CicloAssinatura.criar({
      ...input,
      status: input.status ?? StatusCiclo.PENDENTE,
    });
    return this.cicloService.salvarCiclo(ciclo);
  }
}
