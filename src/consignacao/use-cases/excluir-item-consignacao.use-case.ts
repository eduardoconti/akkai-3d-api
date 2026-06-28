import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
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

export interface ExcluirItemConsignacaoInput {
  idConsignacao: number;
  idItem: number;
}

@Injectable()
export class ExcluirItemConsignacaoUseCase {
  constructor(
    private readonly consignacaoService: ConsignacaoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: ExcluirItemConsignacaoInput,
  ): Promise<DetalheConsignacaoDto> {
    const item = await this.consignacaoService.garantirItemAberto(
      input.idConsignacao,
      input.idItem,
    );
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: item.idProduto,
      quantidade: item.quantidadeEnviada,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    } satisfies CriarMovimentacaoEstoqueInput);

    return this.consignacaoService.excluirItem(item, movimentacao);
  }
}
