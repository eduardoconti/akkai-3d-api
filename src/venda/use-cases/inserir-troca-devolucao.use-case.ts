import { Injectable } from '@nestjs/common';
import { AjusteCarteira, TipoAjusteCarteira } from '@financeiro/entities';
import { CarteiraService } from '@financeiro/services';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import {
  ItemTrocaDevolucao,
  TipoDiferencaTrocaDevolucao,
  TipoItemTrocaDevolucao,
  TrocaDevolucao,
} from '@venda/entities';
import { TrocaDevolucaoService } from '@venda/services';

export interface ExecutarInserirTrocaDevolucaoInput {
  dataTrocaDevolucao: string;
  idCarteira?: number;
  meioPagamento?: MeioPagamento;
  observacao?: string;
  itens: {
    idProduto: number;
    tipo: TipoItemTrocaDevolucao;
    quantidade: number;
    valorUnitario: number;
  }[];
}

@Injectable()
export class InserirTrocaDevolucaoUseCase {
  constructor(
    private readonly trocaDevolucaoService: TrocaDevolucaoService,
    private readonly produtoService: ProdutoService,
    private readonly carteiraService: CarteiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: ExecutarInserirTrocaDevolucaoInput,
  ): Promise<TrocaDevolucao> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;

    await Promise.all(
      input.itens.map((item) =>
        this.produtoService.garantirExisteProduto(item.idProduto),
      ),
    );

    const trocaDevolucao = TrocaDevolucao.criar({
      dataTrocaDevolucao: input.dataTrocaDevolucao,
      idCarteira: input.idCarteira,
      meioPagamento: input.meioPagamento,
      observacao: input.observacao,
      itens: input.itens,
      idUsuarioInclusao,
    });

    if (trocaDevolucao.valorDiferenca > 0) {
      await this.carteiraService.garantirCarteiraAceitaMeioPagamento(
        trocaDevolucao.idCarteira!,
        trocaDevolucao.meioPagamento!,
      );
    }

    const movimentacoesEstoque = trocaDevolucao.itens.map((item) =>
      this.criarMovimentacaoEstoque(item, idUsuarioInclusao),
    );
    const ajusteCarteira = this.criarAjusteCarteira(trocaDevolucao);

    return this.trocaDevolucaoService.inserirTrocaDevolucao(
      trocaDevolucao,
      movimentacoesEstoque,
      ajusteCarteira,
    );
  }

  private criarMovimentacaoEstoque(
    item: ItemTrocaDevolucao,
    idUsuarioInclusao: number,
  ): MovimentacaoEstoque {
    return MovimentacaoEstoque.criar({
      idProduto: item.idProduto,
      quantidade: item.quantidade,
      tipo: item.ehDevolvido()
        ? TipoMovimentacaoEstoque.ENTRADA
        : TipoMovimentacaoEstoque.SAIDA,
      origem: item.ehDevolvido()
        ? OrigemMovimentacaoEstoque.DEVOLUCAO
        : OrigemMovimentacaoEstoque.TROCA,
      idUsuarioInclusao,
    });
  }

  private criarAjusteCarteira(
    trocaDevolucao: TrocaDevolucao,
  ): AjusteCarteira | undefined {
    if (
      trocaDevolucao.tipoDiferenca === TipoDiferencaTrocaDevolucao.SEM_DIFERENCA
    ) {
      return undefined;
    }

    return AjusteCarteira.criar({
      idCarteira: trocaDevolucao.idCarteira!,
      tipo:
        trocaDevolucao.tipoDiferenca === TipoDiferencaTrocaDevolucao.A_PAGAR
          ? TipoAjusteCarteira.CREDITO
          : TipoAjusteCarteira.DEBITO,
      valor: trocaDevolucao.valorDiferenca,
      dataAjuste: trocaDevolucao.dataTrocaDevolucao.toISOString(),
      motivo: 'Diferença de troca/devolução',
      observacao: trocaDevolucao.observacao,
      idUsuarioInclusao: trocaDevolucao.idUsuarioInclusao,
    });
  }
}
