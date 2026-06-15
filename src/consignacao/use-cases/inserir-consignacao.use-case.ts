import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { InserirConsignacaoDto } from '@consignacao/dto';
import { Consignacao, ItemConsignacao } from '@consignacao/entities';
import { ConsignacaoService, RevendedorService } from '@consignacao/services';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { DetalheConsignacaoDto } from '@consignacao/dto/listar-consignacao.dto';

@Injectable()
export class InserirConsignacaoUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly revendedorService: RevendedorService,
    private readonly produtoService: ProdutoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: InserirConsignacaoDto): Promise<DetalheConsignacaoDto> {
    const revendedor = await this.revendedorService.garantirRevendedorAtivo(
      input.idRevendedor,
    );
    this.validarProdutosUnicos(input);

    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    const consignacao = Consignacao.criar({
      idRevendedor: input.idRevendedor,
      idUsuarioInclusao,
      percentualDesconto: revendedor.percentualDesconto,
    });

    const itens: ItemConsignacao[] = [];
    const movimentacoes: MovimentacaoEstoque[] = [];

    for (const itemInput of input.itens) {
      const produto = await this.produtoService.garantirExisteProduto(
        itemInput.idProduto,
      );

      itens.push(
        ItemConsignacao.criar({
          idProduto: itemInput.idProduto,
          quantidadeEnviada: itemInput.quantidade,
          valorUnitario: itemInput.valorUnitario ?? produto.valor,
        }),
      );

      movimentacoes.push(
        MovimentacaoEstoque.criar({
          idProduto: itemInput.idProduto,
          quantidade: itemInput.quantidade,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
          idUsuarioInclusao,
        } satisfies CriarMovimentacaoEstoqueInput),
      );
    }

    return this.consignacaoService.salvarConsignacao(
      consignacao,
      itens,
      movimentacoes,
    );
  }

  private validarProdutosUnicos(input: InserirConsignacaoDto): void {
    const idsProdutos = new Set<number>();

    for (const item of input.itens) {
      if (idsProdutos.has(item.idProduto)) {
        throw new BadRequestException(
          'A consignação não pode repetir o mesmo produto em mais de um item.',
        );
      }

      idsProdutos.add(item.idProduto);
    }
  }
}
