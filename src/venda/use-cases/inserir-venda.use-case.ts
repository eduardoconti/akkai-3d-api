import { OrcamentoService } from '@orcamento/services';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Venda } from '@venda/entities';
import { TipoVenda } from '@venda/enums';
import {
  FeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
  VendaService,
} from '@venda/services';
import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsultaCaixa } from '@financeiro/contracts';

export interface ExecutarInserirVendaInput {
  dataVenda: string;
  tipo: TipoVenda;
  idFeira?: number;
  idCaixa?: number;
  idOrcamento?: number;
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
export class InserirVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly prepararItensVendaService: PrepararItensVendaService,
    private readonly prepararPagamentosVendaService: PrepararPagamentosVendaService,
    private readonly currentUserContext: CurrentUserContext,
    private readonly orcamentoService: OrcamentoService,
    private readonly consultaCaixa: ConsultaCaixa,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const pagamentos = await this.prepararPagamentosVendaService.preparar(
      inserirVendaInput.pagamentos,
    );

    if (inserirVendaInput.idFeira !== undefined) {
      await this.feiraService.garantirExisteFeira(inserirVendaInput.idFeira);
    }

    if (inserirVendaInput.tipo === TipoVenda.FEIRA) {
      await this.consultaCaixa.garantirCaixaAbertoParaVenda({
        idCaixa: inserirVendaInput.idCaixa,
        idFeira: inserirVendaInput.idFeira,
        idsCarteiras: inserirVendaInput.pagamentos.map(
          (pagamento) => pagamento.idCarteira,
        ),
      });
    }

    const itens = await this.prepararItensVendaService.preparar({
      tipo: inserirVendaInput.tipo,
      idFeira: inserirVendaInput.idFeira,
      idUsuarioInclusao,
      itens: inserirVendaInput.itens,
    });

    const venda = Venda.criar({
      dataVenda: inserirVendaInput.dataVenda,
      tipo: inserirVendaInput.tipo,
      idFeira: inserirVendaInput.idFeira,
      idCaixa: inserirVendaInput.idCaixa,
      idOrcamento: inserirVendaInput.idOrcamento,
      desconto: inserirVendaInput.desconto,
      itens,
      pagamentos,
    });
    venda.idUsuarioInclusao = idUsuarioInclusao;

    if (inserirVendaInput.idOrcamento) {
      venda.orcamento =
        await this.orcamentoService.garantirOrcamentoPodeSerFinalizado(
          inserirVendaInput.idOrcamento,
        );
    }

    return this.vendaService.inserirVenda(venda);
  }
}
