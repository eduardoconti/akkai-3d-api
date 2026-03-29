import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
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
  idFeira?: number;
  desconto?: number;
  itens: {
    quantidade: number;
    desconto?: number;
    idProduto: number;
  }[];
}
@Injectable()
export class InserirVendaUseCase {
  constructor(
    private readonly vendaService: VendaService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(inserirVendaInput: ExecutarInserirVendaInput): Promise<Venda> {
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
      const produto = await this.produtoService.getProdutoById(item.idProduto);

      const itemVenda = new ItemVenda();
      itemVenda.idProduto = item.idProduto;
      itemVenda.quantidade = item.quantidade;
      itemVenda.valorUnitario = produto.valor;
      itemVenda.desconto = item.desconto ?? 0;

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
      idFeira: inserirVendaInput.idFeira,
      desconto: inserirVendaInput.desconto,
      itens: itensVenda,
    };

    const venda = Venda.criar(vendaInput);

    return await this.vendaService.inserirVenda(venda, movimentacoesEstoque);
  }
}
