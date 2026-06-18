import { Injectable } from '@nestjs/common';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ItemVendaInput, TipoVenda } from '@venda/entities';
import { PrecoProdutoFeiraService } from '@venda/services/preco-produto-feira.service';

export interface PrepararItemVendaInput {
  quantidade: number;
  brinde?: boolean;
  idProduto?: number;
  nomeProduto?: string;
  valorUnitario?: number;
}

export interface PrepararItensVendaInput {
  tipo: TipoVenda;
  idFeira?: number;
  idUsuarioInclusao: number;
  itens: PrepararItemVendaInput[];
}

export interface ItensVendaPreparados {
  itens: ItemVendaInput[];
  movimentacoesEstoque: MovimentacaoEstoque[];
}

@Injectable()
export class PrepararItensVendaService {
  constructor(
    private readonly produtoService: ProdutoService,
    private readonly precoProdutoFeiraService: PrecoProdutoFeiraService,
  ) {}

  async preparar(
    input: PrepararItensVendaInput,
  ): Promise<ItensVendaPreparados> {
    const itens: ItemVendaInput[] = [];
    const movimentacoesEstoque: MovimentacaoEstoque[] = [];

    for (const item of input.itens) {
      if (item.idProduto === undefined) {
        itens.push({
          nomeProduto: item.nomeProduto!,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario!,
          brinde: item.brinde,
        });
        continue;
      }

      const produto = await this.produtoService.garantirExisteProduto(
        item.idProduto,
      );
      const valorProduto =
        await this.precoProdutoFeiraService.obterValorProdutoParaFeira(
          input.tipo === TipoVenda.FEIRA ? input.idFeira : undefined,
          produto,
        );

      itens.push({
        idProduto: item.idProduto,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        valorUnitario: valorProduto,
        brinde: item.brinde,
      });

      movimentacoesEstoque.push(
        MovimentacaoEstoque.criar({
          idProduto: item.idProduto,
          quantidade: item.quantidade,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          idUsuarioInclusao: input.idUsuarioInclusao,
        }),
      );
    }

    return { itens, movimentacoesEstoque };
  }
}
