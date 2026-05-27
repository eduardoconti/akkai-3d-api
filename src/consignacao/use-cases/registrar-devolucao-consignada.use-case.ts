import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { DetalheConsignacaoDto } from '@consignacao/dto';
import { ConsignacaoService } from '@consignacao/services';

export interface RegistrarDevolucaoConsignadaInput {
  idConsignacao: number;
  idItem: number;
  quantidade: number;
}

@Injectable()
export class RegistrarDevolucaoConsignadaUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: RegistrarDevolucaoConsignadaInput,
  ): Promise<DetalheConsignacaoDto> {
    return this.consignacaoService.registrarDevolucao(
      input.idConsignacao,
      input.idItem,
      input.quantidade,
      this.currentUserContext.usuarioId,
    );
  }
}
