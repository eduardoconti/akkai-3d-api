import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { FinanceiroService } from '@financeiro/services';
import { ProdutoService } from '@produto/services';
import {
  InserirVendaInput as CriarVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
  ItemVenda,
} from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';
import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../common/services/current-user-context.service';

export interface ExecutarInserirVendaInput {
  meioPagamento: MeioPagamento;
  tipo: TipoVenda;
  idCarteira: number;
  idFeira?: number;
  desconto?: number;
  itens: {
    quantidade: number;
    brinde?: boolean;
    idProduto?: number;
    nomeProduto?: string;
    valorUnitario?: number;
  }[];
}
@Injectable()
export class InserirVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly produtoService: ProdutoService,
    private readonly financeiroService: FinanceiroService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;

    await this.financeiroService.garantirCarteiraAceitaMeioPagamento(
      inserirVendaInput.idCarteira,
      inserirVendaInput.meioPagamento,
    );

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

      const itemVenda = ItemVenda.criar({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: produto.valor,
        brinde: item.brinde,
      });

      itensVenda.push(itemVenda);

      const movimentoEstoque = new MovimentacaoEstoque();
      movimentoEstoque.idProduto = item.idProduto;
      movimentoEstoque.quantidade = item.quantidade;
      movimentoEstoque.tipo = TipoMovimentacaoEstoque.SAIDA;
      movimentoEstoque.origem = OrigemMovimentacaoEstoque.VENDA;
      movimentoEstoque.dataInclusao = new Date();
      movimentoEstoque.idUsuarioInclusao = idUsuarioInclusao;

      movimentacoesEstoque.push(movimentoEstoque);
    }

    const vendaInput: CriarVendaInput = {
      meioPagamento: inserirVendaInput.meioPagamento,
      tipo: inserirVendaInput.tipo,
      idCarteira: inserirVendaInput.idCarteira,
      idFeira: inserirVendaInput.idFeira,
      desconto: inserirVendaInput.desconto,
      itens: itensVenda,
    };

    const venda = Venda.criar(vendaInput);
    venda.idUsuarioInclusao = idUsuarioInclusao;

    return await this.vendaService.inserirVenda(venda, movimentacoesEstoque);
  }
}
