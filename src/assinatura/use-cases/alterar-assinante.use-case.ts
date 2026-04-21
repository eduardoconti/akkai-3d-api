import { Injectable } from '@nestjs/common';
import { Assinante, AssinanteInput } from '@assinatura/entities';
import { AssinanteService, PlanoService } from '@assinatura/services';

export interface AlterarAssinanteInput extends AssinanteInput {
  id: number;
}

@Injectable()
export class AlterarAssinanteUseCase {
  constructor(
    private readonly assinanteService: AssinanteService,
    private readonly planoService: PlanoService,
  ) {}

  async execute(input: AlterarAssinanteInput): Promise<Assinante> {
    const assinante = await this.assinanteService.garantirAssinantePorId(
      input.id,
    );
    await this.planoService.garantirPlanoPorId(input.idPlano);
    assinante.atualizar(input);
    return this.assinanteService.salvarAssinante(assinante);
  }
}
