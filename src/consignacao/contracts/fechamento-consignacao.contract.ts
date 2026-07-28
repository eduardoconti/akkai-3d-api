import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import {
  DetalheConsignacaoDto,
  FecharItemConsignacaoDto,
} from '@consignacao/dto';

export interface PagamentoFechamentoConsignacao {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  percentualTaxa?: number | null;
  percentualImposto?: number | null;
}

export abstract class FechamentoConsignacao {
  abstract fecharConsignacao(
    idConsignacao: number,
    itensFechamento: FecharItemConsignacaoDto[],
    pagamento: PagamentoFechamentoConsignacao | undefined,
    idUsuarioInclusao: number,
  ): Promise<DetalheConsignacaoDto>;
}
