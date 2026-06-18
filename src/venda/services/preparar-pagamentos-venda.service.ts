import { Injectable } from '@nestjs/common';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { MeioPagamento, PagamentoVendaInput } from '@venda/entities';

export interface PrepararPagamentoVendaInput {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  valor: number;
}

@Injectable()
export class PrepararPagamentosVendaService {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
  ) {}

  async preparar(
    pagamentosInput: PrepararPagamentoVendaInput[],
  ): Promise<PagamentoVendaInput[]> {
    const pagamentos: PagamentoVendaInput[] = [];

    for (const pagamento of pagamentosInput) {
      const carteira =
        await this.carteiraService.garantirCarteiraAceitaMeioPagamento(
          pagamento.idCarteira,
          pagamento.meioPagamento,
        );

      const taxaMeioPagamentoCarteira =
        await this.taxaMeioPagamentoCarteiraService.obterTaxaAtivaPorCarteiraEMeioPagamento(
          pagamento.idCarteira,
          pagamento.meioPagamento,
        );

      pagamentos.push({
        idCarteira: pagamento.idCarteira,
        meioPagamento: pagamento.meioPagamento,
        valor: pagamento.valor,
        percentualTaxa: taxaMeioPagamentoCarteira?.percentual ?? null,
        percentualImposto: carteira.consideraImpostoVenda
          ? (carteira.percentualImpostoVenda ?? null)
          : null,
      });
    }

    return pagamentos;
  }
}
