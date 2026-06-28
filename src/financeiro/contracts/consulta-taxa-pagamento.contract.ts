import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export type DadosTaxaPagamento = {
  percentual: number;
};

export abstract class ConsultaTaxaPagamento {
  abstract obterTaxaAtivaPorCarteiraEMeioPagamento(
    idCarteira: number,
    meioPagamento: MeioPagamento,
  ): Promise<DadosTaxaPagamento | null>;
}
