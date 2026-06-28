import { Injectable } from '@nestjs/common';
import { ConsultaCarteira, ConsultaTaxaPagamento } from '@financeiro/contracts';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { PagamentoVendaInput } from '@venda/entities';

export interface PrepararPagamentoVendaInput {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  valor: number;
}

@Injectable()
export class PrepararPagamentosVendaService {
  constructor(
    private readonly consultaCarteira: ConsultaCarteira,
    private readonly consultaTaxaPagamento: ConsultaTaxaPagamento,
  ) {}

  async preparar(
    pagamentosInput: PrepararPagamentoVendaInput[],
  ): Promise<PagamentoVendaInput[]> {
    const pagamentos: PagamentoVendaInput[] = [];

    for (const pagamento of pagamentosInput) {
      const carteira =
        await this.consultaCarteira.garantirCarteiraAceitaMeioPagamento(
          pagamento.idCarteira,
          pagamento.meioPagamento,
        );

      const taxaMeioPagamentoCarteira =
        await this.consultaTaxaPagamento.obterTaxaAtivaPorCarteiraEMeioPagamento(
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
