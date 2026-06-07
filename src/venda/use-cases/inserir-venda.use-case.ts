import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { ProdutoService } from '@produto/services';
import {
  InserirVendaInput as CriarVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
  ItemVenda,
} from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';

export interface ExecutarInserirVendaInput {
  dataVenda: string;
  tipo: TipoVenda;
  idFeira?: number;
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
    private readonly produtoService: ProdutoService,
    private readonly carteiraService: CarteiraService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
    private readonly precoProdutoFeiraService: PrecoProdutoFeiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const pagamentos = await this.criarPagamentos(inserirVendaInput.pagamentos);

    if (inserirVendaInput.idFeira !== undefined) {
      await this.feiraService.garantirExisteFeira(inserirVendaInput.idFeira);
    }

    const itensVenda: ItemVenda[] = [];
    const movimentacoesEstoque: MovimentacaoEstoque[] = [];

    for (const item of inserirVendaInput.itens) {
      if (item.idProduto === undefined) {
        const itemVenda = ItemVenda.criar({
          nomeProduto: item.nomeProduto!,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario!,
          brinde: item.brinde,
        });

        itensVenda.push(itemVenda);
        continue;
      }

      const produto = await this.produtoService.garantirExisteProduto(
        item.idProduto,
      );
      const valorProduto =
        await this.precoProdutoFeiraService.obterValorProdutoParaFeira(
          inserirVendaInput.tipo === TipoVenda.FEIRA
            ? inserirVendaInput.idFeira
            : undefined,
          produto,
        );

      const itemVenda = ItemVenda.criar({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: valorProduto,
        brinde: item.brinde,
      });

      itensVenda.push(itemVenda);

      const movimentoEstoque = MovimentacaoEstoque.criar({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.VENDA,
        idUsuarioInclusao,
      });

      movimentacoesEstoque.push(movimentoEstoque);
    }

    const vendaInput: CriarVendaInput = {
      dataVenda: inserirVendaInput.dataVenda,
      tipo: inserirVendaInput.tipo,
      idFeira: inserirVendaInput.idFeira,
      desconto: inserirVendaInput.desconto,
      itens: itensVenda,
      pagamentos,
    };

    const venda = Venda.criar(vendaInput);
    venda.idUsuarioInclusao = idUsuarioInclusao;

    return await this.vendaService.inserirVenda(venda, movimentacoesEstoque);
  }

  private async criarPagamentos(
    pagamentosInput: ExecutarInserirVendaInput['pagamentos'],
  ): Promise<CriarVendaInput['pagamentos']> {
    const pagamentos: CriarVendaInput['pagamentos'] = [];

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
