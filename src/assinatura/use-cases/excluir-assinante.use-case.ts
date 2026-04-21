import { Injectable } from '@nestjs/common';
import { AssinanteService } from '@assinatura/services';

export interface ExcluirAssinanteInput {
  id: number;
}

@Injectable()
export class ExcluirAssinanteUseCase {
  constructor(private readonly assinanteService: AssinanteService) {}

  async execute(input: ExcluirAssinanteInput): Promise<void> {
    await this.assinanteService.garantirAssinantePorId(input.id);
    await this.assinanteService.excluirAssinante(input.id);
  }
}
