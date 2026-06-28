import { Injectable } from '@nestjs/common';
import {
  DetalheConsignacaoDto,
  RegistrarItemVendaConsignadaDto,
} from '@consignacao/dto';
import { ConsignacaoService } from '@consignacao/services';
import { ConsultaCarteira, ConsultaTaxaPagamento } from '@financeiro/contracts';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

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
    private readonly consultaCarteira: ConsultaCarteira,
    private readonly consultaTaxaPagamento: ConsultaTaxaPagamento,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: RegistrarVendasRevendedorConsignadoInput,
  ): Promise<DetalheConsignacaoDto[]> {
    const carteira =
      await this.consultaCarteira.garantirCarteiraAceitaMeioPagamento(
        input.idCarteira,
        input.meioPagamento,
      );
    const taxaMeioPagamentoCarteira =
      await this.consultaTaxaPagamento.obterTaxaAtivaPorCarteiraEMeioPagamento(
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
