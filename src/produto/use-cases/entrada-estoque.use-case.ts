import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { EstoqueService } from '@produto/services';
import { OrigemMovimentacaoEstoque } from '@produto/entities';

export interface EntradaEstoqueInput {
  idProduto: number;
  quantidade: number;
  origem:
    | OrigemMovimentacaoEstoque.COMPRA
    | OrigemMovimentacaoEstoque.AJUSTE
    | OrigemMovimentacaoEstoque.PRODUCAO;
}

@Injectable()
export class EntradaEstoqueUseCase {
  constructor(
    private readonly estoqueService: EstoqueService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: EntradaEstoqueInput): Promise<void> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    await this.estoqueService.entradaEstoque(
      input.idProduto,
      input.quantidade,
      input.origem,
      idUsuarioInclusao,
    );
  }
}
