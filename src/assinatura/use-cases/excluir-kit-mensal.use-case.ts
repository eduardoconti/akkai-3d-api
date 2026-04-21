import { Injectable } from '@nestjs/common';
import { KitMensalService } from '@assinatura/services';

export interface ExcluirKitMensalInput {
  id: number;
}

@Injectable()
export class ExcluirKitMensalUseCase {
  constructor(private readonly kitMensalService: KitMensalService) {}

  async execute(input: ExcluirKitMensalInput): Promise<void> {
    await this.kitMensalService.garantirKitPorId(input.id);
    await this.kitMensalService.excluirKit(input.id);
  }
}
