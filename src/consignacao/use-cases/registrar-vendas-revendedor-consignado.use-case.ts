import { Injectable } from '@nestjs/common';
import {
  DetalheConsignacaoDto,
  RegistrarItemVendaConsignadaDto,
} from '@consignacao/dto';
import { ConsignacaoService } from '@consignacao/services';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { MeioPagamento } from '@venda/entities';

export interface RegistrarVendasRevendedorConsignadoInput {
  idRevendedor: number;
  idCarteira: number;
  meioPagamento: MeioPagamento;
  itens: RegistrarItemVendaConsignadaDto[];
}

@Injectable()
export class RegistrarVendasRevendedorConsignadoUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly carteiraService: CarteiraService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: RegistrarVendasRevendedorConsignadoInput,
  ): Promise<DetalheConsignacaoDto[]> {
    const carteira =
      await this.carteiraService.garantirCarteiraAceitaMeioPagamento(
        input.idCarteira,
        input.meioPagamento,
      );
    const taxaMeioPagamentoCarteira =
      await this.taxaMeioPagamentoCarteiraService.obterTaxaAtivaPorCarteiraEMeioPagamento(
        input.idCarteira,
        input.meioPagamento,
      );

    return this.consignacaoService.registrarVendasPorRevendedor(
      input.idRevendedor,
      input.itens,
      {
        idCarteira: input.idCarteira,
        meioPagamento: input.meioPagamento,
        percentualTaxa: taxaMeioPagamentoCarteira?.percentual ?? null,
        percentualImposto: carteira.consideraImpostoVenda
          ? (carteira.percentualImpostoVenda ?? null)
          : null,
      },
      this.currentUserContext.usuarioId,
    );
  }
}
