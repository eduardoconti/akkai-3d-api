import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { InserirTransferenciaCarteiraDto } from '@financeiro/dto';
import { TransferenciaCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TransferenciaCarteiraService,
} from '@financeiro/services';

@Injectable()
export class InserirTransferenciaCarteiraUseCase {
  constructor(
    private readonly transferenciaCarteiraService: TransferenciaCarteiraService,
    private readonly carteiraService: CarteiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: InserirTransferenciaCarteiraDto,
  ): Promise<TransferenciaCarteira> {
    if (input.idCarteiraOrigem === input.idCarteiraDestino) {
      throw new BadRequestException(
        'A carteira de origem e a carteira de destino devem ser diferentes.',
      );
    }

    await this.carteiraService.garantirExisteCarteira(input.idCarteiraOrigem);
    await this.carteiraService.garantirExisteCarteira(input.idCarteiraDestino);

    const transferencia = TransferenciaCarteira.criar({
      ...input,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    });

    return this.transferenciaCarteiraService.inserirTransferenciaCarteira(
      transferencia,
    );
  }
}
