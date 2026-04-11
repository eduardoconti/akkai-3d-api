import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { EstoqueService } from '@produto/services';
import { OrigemMovimentacaoEstoque } from '@produto/entities';

export interface SaidaEstoqueInput {
  idProduto: number;
  quantidade: number;
  origem: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA;
}

@Injectable()
export class SaidaEstoqueUseCase {
  constructor(
    private readonly estoqueService: EstoqueService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: SaidaEstoqueInput): Promise<void> {
    const idUsuarioInclusao = this.currentUserContext.usuarioId;
    await this.estoqueService.saidaEstoque(
      input.idProduto,
      input.quantidade,
      input.origem,
      idUsuarioInclusao,
    );
  }
}
