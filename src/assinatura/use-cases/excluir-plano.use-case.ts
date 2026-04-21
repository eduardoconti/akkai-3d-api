import { Injectable } from '@nestjs/common';
import { PlanoService } from '@assinatura/services';

export interface ExcluirPlanoInput {
  id: number;
}

@Injectable()
export class ExcluirPlanoUseCase {
  constructor(private readonly planoService: PlanoService) {}

  async execute(input: ExcluirPlanoInput): Promise<void> {
    await this.planoService.garantirPlanoPorId(input.id);
    await this.planoService.excluirPlano(input.id);
  }
}
