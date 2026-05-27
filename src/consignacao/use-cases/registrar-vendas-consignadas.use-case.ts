import { Injectable } from '@nestjs/common';
import {
  DetalheConsignacaoDto,
  RegistrarItemVendaConsignadaDto,
} from '@consignacao/dto';
import { ConsignacaoService } from '@consignacao/services';

export interface RegistrarVendasConsignadasInput {
  idConsignacao: number;
  itens: RegistrarItemVendaConsignadaDto[];
}

@Injectable()
export class RegistrarVendasConsignadasUseCase {
  constructor(private readonly consignacaoService: ConsignacaoService) {}

  async execute(
    input: RegistrarVendasConsignadasInput,
  ): Promise<DetalheConsignacaoDto> {
    return this.consignacaoService.registrarVendas(
      input.idConsignacao,
      input.itens,
    );
  }
}
