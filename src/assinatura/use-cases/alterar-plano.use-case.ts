import { Injectable } from '@nestjs/common';
import { PlanoAssinatura, PlanoAssinaturaInput } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';

export interface AlterarPlanoInput extends PlanoAssinaturaInput {
  id: number;
}

@Injectable()
export class AlterarPlanoUseCase {
  constructor(private readonly planoService: PlanoService) {}

  async execute(input: AlterarPlanoInput): Promise<PlanoAssinatura> {
    const plano = await this.planoService.garantirPlanoPorId(input.id);
    plano.atualizar(input);
    return this.planoService.salvarPlano(plano);
  }
}
