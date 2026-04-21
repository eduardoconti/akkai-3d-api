import { Injectable } from '@nestjs/common';
import { CicloService } from '@assinatura/services';

export interface ExcluirCicloInput {
  id: number;
}

@Injectable()
export class ExcluirCicloUseCase {
  constructor(private readonly cicloService: CicloService) {}

  async execute(input: ExcluirCicloInput): Promise<void> {
    await this.cicloService.garantirCicloPorId(input.id);
    await this.cicloService.excluirCiclo(input.id);
  }
}
