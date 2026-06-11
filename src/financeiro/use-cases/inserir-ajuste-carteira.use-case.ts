import { Injectable } from '@nestjs/common';
import { InserirAjusteCarteiraDto } from '@financeiro/dto';
import { AjusteCarteira } from '@financeiro/entities';
import { AjusteCarteiraService, CarteiraService } from '@financeiro/services';
import { CurrentUserContext } from '@common/services/current-user-context.service';

export interface ExecutarInserirAjusteCarteiraInput
  extends InserirAjusteCarteiraDto {
  idCarteira: number;
}

@Injectable()
export class InserirAjusteCarteiraUseCase {
  constructor(
    private readonly ajusteCarteiraService: AjusteCarteiraService,
    private readonly carteiraService: CarteiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: ExecutarInserirAjusteCarteiraInput,
  ): Promise<AjusteCarteira> {
    await this.carteiraService.garantirExisteCarteira(input.idCarteira);

    const ajuste = AjusteCarteira.criar({
      ...input,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    });

    return this.ajusteCarteiraService.inserirAjusteCarteira(ajuste);
  }
}
