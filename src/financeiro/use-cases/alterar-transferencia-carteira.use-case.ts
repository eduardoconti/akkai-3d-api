import { BadRequestException, Injectable } from '@nestjs/common';
import { AlterarTransferenciaCarteiraDto } from '@financeiro/dto';
import { TransferenciaCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TransferenciaCarteiraService,
} from '@financeiro/services';

export interface AlterarTransferenciaCarteiraInput
  extends AlterarTransferenciaCarteiraDto {
  id: number;
}

@Injectable()
export class AlterarTransferenciaCarteiraUseCase {
  constructor(
    private readonly transferenciaCarteiraService: TransferenciaCarteiraService,
    private readonly carteiraService: CarteiraService,
  ) {}

  async execute(
    input: AlterarTransferenciaCarteiraInput,
  ): Promise<TransferenciaCarteira> {
    if (input.idCarteiraOrigem === input.idCarteiraDestino) {
      throw new BadRequestException(
        'A carteira de origem e a carteira de destino devem ser diferentes.',
      );
    }

    const transferencia =
      await this.transferenciaCarteiraService.garantirTransferenciaPorId(
        input.id,
      );

    await this.carteiraService.garantirExisteCarteira(input.idCarteiraOrigem);
    await this.carteiraService.garantirExisteCarteira(input.idCarteiraDestino);

    transferencia.atualizar(input);

    return this.transferenciaCarteiraService.alterarTransferenciaCarteira(
      transferencia,
    );
  }
}
