import { Injectable } from '@nestjs/common';
import { PlanoAssinatura, PlanoAssinaturaInput } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';

@Injectable()
export class InserirPlanoUseCase {
  constructor(private readonly planoService: PlanoService) {}

  async execute(input: PlanoAssinaturaInput): Promise<PlanoAssinatura> {
    const plano = PlanoAssinatura.criar(input);
    return this.planoService.salvarPlano(plano);
  }
}
