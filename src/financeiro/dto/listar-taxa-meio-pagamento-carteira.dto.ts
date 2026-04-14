import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class ListarTaxaMeioPagamentoCarteiraDto {
  id!: number;
  idCarteira!: number;
  meioPagamento!: MeioPagamento;
  percentual!: number;
  ativa!: boolean;
  carteira!: {
    id: number;
    nome: string;
    ativa: boolean;
  };
}
