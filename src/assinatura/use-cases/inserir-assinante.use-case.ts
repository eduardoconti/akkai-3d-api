import { Injectable } from '@nestjs/common';
import { Assinante, AssinanteInput } from '@assinatura/entities';
import { StatusAssinante } from '@assinatura/enums';
import { AssinanteService, PlanoService } from '@assinatura/services';

@Injectable()
export class InserirAssinanteUseCase {
  constructor(
    private readonly assinanteService: AssinanteService,
    private readonly planoService: PlanoService,
  ) {}

  async execute(input: AssinanteInput): Promise<Assinante> {
    await this.planoService.garantirPlanoPorId(input.idPlano);
    const assinante = Assinante.criar({
      ...input,
      status: input.status ?? StatusAssinante.ATIVO,
    });
    return this.assinanteService.salvarAssinante(assinante);
  }
}
