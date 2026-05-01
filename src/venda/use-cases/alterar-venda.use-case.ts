import { Injectable } from '@nestjs/common';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { ProdutoService } from '@produto/services';
import {
  InserirVendaInput as AtualizarVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
} from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import { CurrentUserContext } from '@common/services/current-user-context.service';

export interface ExecutarAlterarVendaInput {
  id: number;
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
export class AlterarVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly produtoService: ProdutoService,
    private readonly carteiraService: CarteiraService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
    private readonly precoProdutoFeiraService: PrecoProdutoFeiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: ExecutarAlterarVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const venda = await this.vendaService.garantirExisteVenda(input.id);
    const pagamentos = await this.criarPagamentos(input.pagamentos);

    if (input.idFeira !== undefined) {
      await this.feiraService.garantirExisteFeira(input.idFeira);
    }

    const movimentacoesEstoque: MovimentacaoEstoque[] = [];
    const itensVenda: AtualizarVendaInput['itens'] = [];

    for (const item of input.itens) {
      if (item.idProduto === undefined) {
        itensVenda.push({
          nomeProduto: item.nomeProduto!,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario!,
          brinde: item.brinde,
        });
        continue;
      }

      const produto: Produto = await this.produtoService.garantirExisteProduto(
        item.idProduto,
      );
      const valorProduto =
        await this.precoProdutoFeiraService.obterValorProdutoParaFeira(
          input.tipo === TipoVenda.FEIRA ? input.idFeira : undefined,
          produto,
        );

      itensVenda.push({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: valorProduto,
        brinde: item.brinde,
      });

      const movimentoEstoque = MovimentacaoEstoque.criar({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.VENDA,
        idUsuarioInclusao,
      });
      movimentacoesEstoque.push(movimentoEstoque);
    }

    venda.atualizar({
      tipo: input.tipo,
      idFeira: input.idFeira,
      desconto: input.desconto,
      itens: itensVenda,
      pagamentos,
    });

    return await this.vendaService.alterarVenda(venda, movimentacoesEstoque);
  }

  private async criarPagamentos(
    pagamentosInput: ExecutarAlterarVendaInput['pagamentos'],
  ): Promise<AtualizarVendaInput['pagamentos']> {
    const pagamentos: AtualizarVendaInput['pagamentos'] = [];

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
