import { FinalizacaoOrcamento } from '@orcamento/contracts';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Venda } from '@venda/entities';
import { TipoVenda } from '@venda/enums';
import {
  FeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
  VendaService,
} from '@venda/services';
import { ConflictException, Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsultaCaixa } from '@financeiro/contracts';

export interface ExecutarInserirVendaInput {
  dataVenda: string;
  tipo: TipoVenda;
  idFeira?: number;
  idCaixa?: number;
  idOrcamento?: number;
  desconto?: number;
  chaveIdempotencia?: string;
  /** Venda feita sem conexão e sincronizada depois pela fila do aparelho. */
  vendaOffline?: boolean;
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
    private readonly finalizacaoOrcamento: FinalizacaoOrcamento,
    private readonly consultaCaixa: ConsultaCaixa,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const vendaJaRegistrada = await this.obterVendaJaRegistrada(
      inserirVendaInput.chaveIdempotencia,
      idUsuarioInclusao,
    );

    if (vendaJaRegistrada) {
      return vendaJaRegistrada;
    }

    const pagamentos = await this.prepararPagamentosVendaService.preparar(
      inserirVendaInput.pagamentos,
    );

    if (inserirVendaInput.idFeira !== undefined) {
      await this.feiraService.garantirExisteFeira(inserirVendaInput.idFeira);
    }

    const idCaixa = await this.resolverCaixa(inserirVendaInput);

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
      idCaixa,
      idOrcamento: inserirVendaInput.idOrcamento,
      desconto: inserirVendaInput.desconto,
      chaveIdempotencia: inserirVendaInput.chaveIdempotencia,
      itens,
      pagamentos,
    });
    venda.idUsuarioInclusao = idUsuarioInclusao;

    if (inserirVendaInput.idOrcamento) {
      venda.orcamento =
        await this.finalizacaoOrcamento.garantirPodeSerFinalizado(
          inserirVendaInput.idOrcamento,
        );
    }

    return this.vendaService.inserirVenda(venda, {
      caixaOpcional: inserirVendaInput.vendaOffline === true,
    });
  }

  /**
   * Venda online exige o caixa aberto. Venda offline já aconteceu: entra no
   * caixa aberto que a aceite ou, se não houver, sem caixa.
   */
  private async resolverCaixa(
    inserirVendaInput: ExecutarInserirVendaInput,
  ): Promise<number | undefined> {
    if (inserirVendaInput.tipo !== TipoVenda.FEIRA) {
      return inserirVendaInput.idCaixa;
    }

    const dadosCaixa = {
      idCaixa: inserirVendaInput.idCaixa,
      idFeira: inserirVendaInput.idFeira,
      idsCarteiras: inserirVendaInput.pagamentos.map(
        (pagamento) => pagamento.idCarteira,
      ),
    };

    if (inserirVendaInput.vendaOffline) {
      return this.consultaCaixa.resolverCaixaParaVendaOffline(dadosCaixa);
    }

    await this.consultaCaixa.garantirCaixaAbertoParaVenda(dadosCaixa);
    return inserirVendaInput.idCaixa;
  }

  /**
   * Reenvios da mesma venda (ex.: sincronização offline com resposta perdida)
   * devolvem a venda original, sem repetir estoque nem pagamentos.
   */
  private async obterVendaJaRegistrada(
    chaveIdempotencia: string | undefined,
    idUsuario: number,
  ): Promise<Venda | null> {
    if (!chaveIdempotencia) {
      return null;
    }

    const venda =
      await this.vendaService.obterVendaPorChaveIdempotencia(chaveIdempotencia);

    if (venda && venda.idUsuarioInclusao !== idUsuario) {
      throw new ConflictException(
        'A chave de idempotência informada já foi utilizada.',
      );
    }

    return venda;
  }
}
