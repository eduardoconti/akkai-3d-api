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
import { VendaService } from '@venda/services';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface ExecutarInserirVendaInput {
  meioPagamento: MeioPagamento;
  tipo: TipoVenda;
  idCarteira: number;
  idFeira?: number;
  desconto?: number;
  itens: {
    quantidade: number;
    desconto?: number;
    idProduto?: number;
    nomeProduto?: string;
    valorUnitario?: number;
  }[];
}
@Injectable()
export class InserirVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly produtoService: ProdutoService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
    const carteiraExiste = await this.financeiroService.existeCarteira(
      inserirVendaInput.idCarteira,
    );

    if (!carteiraExiste) {
      throw new NotFoundException(
        `Carteira com ID ${inserirVendaInput.idCarteira} não encontrada.`,
      );
    }

    if (inserirVendaInput.idFeira !== undefined) {
      const feiraExiste = await this.vendaService.existeFeira(
        inserirVendaInput.idFeira,
      );

      if (!feiraExiste) {
        throw new NotFoundException(
          `Feira com ID ${inserirVendaInput.idFeira} não encontrada.`,
        );
      }
    }

    const itensVenda: ItemVenda[] = [];
    const movimentacoesEstoque: MovimentacaoEstoque[] = [];

    for (const item of inserirVendaInput.itens) {
      if (item.idProduto === undefined) {
        const itemVenda = ItemVenda.criar({
          nomeProduto: item.nomeProduto!,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario!,
          desconto: item.desconto,
        });

        itensVenda.push(itemVenda);
        continue;
      }

      const produto = await this.produtoService.obterProdutoPorId(
        item.idProduto,
      );

      if (!produto) {
        throw new NotFoundException(
          `Produto com ID ${item.idProduto} não encontrado.`,
        );
      }

      const itemVenda = ItemVenda.criar({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: produto.valor,
        desconto: item.desconto,
      });

      itensVenda.push(itemVenda);

      const movimentoEstoque = new MovimentacaoEstoque();
      movimentoEstoque.idProduto = item.idProduto;
      movimentoEstoque.quantidade = item.quantidade;
      movimentoEstoque.tipo = TipoMovimentacaoEstoque.SAIDA;
      movimentoEstoque.origem = OrigemMovimentacaoEstoque.VENDA;
      movimentoEstoque.dataInclusao = new Date();

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

    return await this.vendaService.inserirVenda(venda, movimentacoesEstoque);
  }
}
