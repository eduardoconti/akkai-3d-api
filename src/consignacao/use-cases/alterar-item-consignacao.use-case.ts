import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { AlterarItemConsignacaoDto } from '@consignacao/dto';
import { ConsignacaoService } from '@consignacao/services';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
} from '@produto/entities';
import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/enums';
import { DetalheConsignacaoDto } from '@consignacao/dto/listar-consignacao.dto';

export interface AlterarItemConsignacaoInput {
  idConsignacao: number;
  idItem: number;
  item: AlterarItemConsignacaoDto;
}

@Injectable()
export class AlterarItemConsignacaoUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: AlterarItemConsignacaoInput,
  ): Promise<DetalheConsignacaoDto> {
    const item = await this.consignacaoService.garantirItemAberto(
      input.idConsignacao,
      input.idItem,
    );
    const diferencaQuantidade = input.item.quantidade - item.quantidadeEnviada;

    const movimentacao = this.criarMovimentacaoSeNecessario(
      item.idProduto,
      diferencaQuantidade,
    );

    return this.consignacaoService.alterarItem(
      item,
      input.item.quantidade,
      input.item.valorUnitario ?? item.valorUnitario,
      movimentacao,
    );
  }

  private criarMovimentacaoSeNecessario(
    idProduto: number,
    diferencaQuantidade: number,
  ): MovimentacaoEstoque | undefined {
    if (diferencaQuantidade === 0) {
      return undefined;
    }

    return MovimentacaoEstoque.criar({
      idProduto,
      quantidade: Math.abs(diferencaQuantidade),
      tipo:
        diferencaQuantidade > 0
          ? TipoMovimentacaoEstoque.SAIDA
          : TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    } satisfies CriarMovimentacaoEstoqueInput);
  }
}
