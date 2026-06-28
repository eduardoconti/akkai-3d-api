import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { InserirItemConsignacaoDto } from '@consignacao/dto';
import { ItemConsignacao } from '@consignacao/entities';
import { ConsignacaoService } from '@consignacao/services';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
} from '@produto/entities';
import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/enums';
import { ProdutoService } from '@produto/services';
import { DetalheConsignacaoDto } from '@consignacao/dto/listar-consignacao.dto';

export interface AdicionarItemConsignacaoInput {
  idConsignacao: number;
  item: InserirItemConsignacaoDto;
}

@Injectable()
export class AdicionarItemConsignacaoUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly produtoService: ProdutoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: AdicionarItemConsignacaoInput,
  ): Promise<DetalheConsignacaoDto> {
    const produto = await this.produtoService.garantirExisteProduto(
      input.item.idProduto,
    );

    const item = ItemConsignacao.criar({
      idProduto: input.item.idProduto,
      quantidadeEnviada: input.item.quantidade,
      valorUnitario: input.item.valorUnitario ?? produto.valor,
    });
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: input.item.idProduto,
      quantidade: input.item.quantidade,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    } satisfies CriarMovimentacaoEstoqueInput);

    return this.consignacaoService.adicionarItem(
      input.idConsignacao,
      item,
      movimentacao,
    );
  }
}
