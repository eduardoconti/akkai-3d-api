import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export type DadosCarteiraPagamento = {
  id: number;
  consideraImpostoVenda: boolean;
  percentualImpostoVenda?: number | null;
};

export abstract class ConsultaCarteira {
  abstract garantirExisteCarteira(id: number): Promise<void>;

  abstract garantirCarteiraAceitaMeioPagamento(
    idCarteira: number,
    meioPagamento: MeioPagamento,
  ): Promise<DadosCarteiraPagamento>;
}
