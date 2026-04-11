import { Injectable } from '@nestjs/common';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { FinanceiroService } from '@financeiro/services';
import { ProdutoService } from '@produto/services';
import {
  InserirVendaInput as AtualizarVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
} from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';

export interface ExecutarAlterarVendaInput {
  id: number;
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
export class AlterarVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly produtoService: ProdutoService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  async execute(input: ExecutarAlterarVendaInput): Promise<Venda> {
    const venda = await this.vendaService.garantirExisteVenda(input.id);

    await this.financeiroService.garantirCarteiraAceitaMeioPagamento(
      input.idCarteira,
      input.meioPagamento,
    );

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

      itensVenda.push({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: produto.valor,
        brinde: item.brinde,
      });

      const movimentoEstoque = new MovimentacaoEstoque();
      movimentoEstoque.idProduto = item.idProduto;
      movimentoEstoque.quantidade = item.quantidade;
      movimentoEstoque.tipo = TipoMovimentacaoEstoque.SAIDA;
      movimentoEstoque.origem = OrigemMovimentacaoEstoque.VENDA;
      movimentoEstoque.dataInclusao = new Date();
      movimentacoesEstoque.push(movimentoEstoque);
    }

    venda.atualizar({
      meioPagamento: input.meioPagamento,
      tipo: input.tipo,
      idCarteira: input.idCarteira,
      idFeira: input.idFeira,
      desconto: input.desconto,
      itens: itensVenda,
    });

    return await this.vendaService.alterarVenda(venda, movimentacoesEstoque);
  }
}
