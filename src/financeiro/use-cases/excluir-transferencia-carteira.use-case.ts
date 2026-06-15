import { Injectable } from '@nestjs/common';
import { TransferenciaCarteiraService } from '@financeiro/services';

export interface ExcluirTransferenciaCarteiraInput {
  id: number;
}

@Injectable()
export class ExcluirTransferenciaCarteiraUseCase {
  constructor(
    private readonly transferenciaCarteiraService: TransferenciaCarteiraService,
  ) {}

  async execute(input: ExcluirTransferenciaCarteiraInput): Promise<void> {
    const transferencia =
      await this.transferenciaCarteiraService.garantirTransferenciaPorId(
        input.id,
      );

    await this.transferenciaCarteiraService.excluirTransferenciaCarteira(
      transferencia.id,
    );
  }
}
