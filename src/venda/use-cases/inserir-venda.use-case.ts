import { ProdutoService } from 'src/produto/services/produto.service';
import { MeioPagamento, TipoVenda, Venda } from '../entities/venda.entity';
import { ItemVenda } from '../entities/item-venda.entity';
import { VendaService } from '../services/venda.service';
import { Injectable } from '@nestjs/common';
import { MovimentacaoEstoque } from 'src/produto/entities/movimentacao-estoque.entity';

export interface InserirVendaInput {
  meioPagamento: MeioPagamento;
  tipo: TipoVenda;
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

  async execute(inserirVendaInput: InserirVendaInput): Promise<Venda> {
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
      movimentoEstoque.tipo = 'S';
      movimentoEstoque.origem = 'VENDA';
      movimentoEstoque.dataInclusao = new Date();

      movimentacoesEstoque.push(movimentoEstoque);
    }

    const venda = Venda.criar({
      meioPagamento: inserirVendaInput.meioPagamento,
      tipo: inserirVendaInput.tipo,
      desconto: inserirVendaInput.desconto,
      itens: itensVenda,
    });

    return await this.vendaService.inserirVenda(venda, movimentacoesEstoque);
  }
}
