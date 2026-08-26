import { Injectable } from '@nestjs/common';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Venda } from '@venda/entities';
import { TipoVenda } from '@venda/enums';
import {
  FeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
  VendaService,
} from '@venda/services';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsultaCaixa } from '@financeiro/contracts';

export interface ExecutarAlterarVendaInput {
  id: number;
  dataVenda: string;
  tipo: TipoVenda;
  idFeira?: number;
  idCaixa?: number;
  desconto?: number;
  itens: {
    quantidade: number;
    brinde?: boolean;
    idProduto?: number;
    nomeProduto?: string;
    valorUnitario?: number;
  }[];
  pagamentos: {
    idCarteira: number;
    meioPagamento: MeioPagamento;
    valor: number;
  }[];
}

@Injectable()
export class AlterarVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly prepararItensVendaService: PrepararItensVendaService,
    private readonly prepararPagamentosVendaService: PrepararPagamentosVendaService,
    private readonly currentUserContext: CurrentUserContext,
    private readonly consultaCaixa: ConsultaCaixa,
  ) {}

  async execute(input: ExecutarAlterarVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const venda = await this.vendaService.garantirExisteVenda(input.id);
    const pagamentos = await this.prepararPagamentosVendaService.preparar(
      input.pagamentos,
    );

    if (input.idFeira !== undefined) {
      await this.feiraService.garantirExisteFeira(input.idFeira);
    }

    if (input.tipo === TipoVenda.FEIRA) {
      await this.consultaCaixa.garantirCaixaAbertoParaVenda({
        idCaixa: input.idCaixa ?? venda.idCaixa,
        idFeira: input.idFeira,
        idsCarteiras: input.pagamentos.map((pagamento) => pagamento.idCarteira),
      });
    }

    const itens = await this.prepararItensVendaService.preparar({
      tipo: input.tipo,
      idFeira: input.idFeira,
      idUsuarioInclusao,
      itens: input.itens,
    });

    venda.atualizar({
      dataVenda: input.dataVenda,
      tipo: input.tipo,
      idFeira: input.idFeira,
      idCaixa:
        input.tipo === TipoVenda.FEIRA
          ? (input.idCaixa ?? venda.idCaixa)
          : undefined,
      idOrcamento: venda.idOrcamento,
      desconto: input.desconto,
      itens,
      pagamentos,
    });

    return this.vendaService.alterarVenda(venda);
  }
}
