import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';

export interface InserirProdutoInput {
  nome: string;
  codigo: string;
  descricao?: string;
  estoqueMinimo?: number;
  idCategoria: number;
  valor: number;
}

@Injectable()
export class InserirProdutoUseCase {
  constructor(
    private readonly produtoService: ProdutoService,
    private readonly categoriaProdutoService: CategoriaProdutoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: InserirProdutoInput): Promise<Produto> {
    await this.categoriaProdutoService.garantirExisteCategoria(
      input.idCategoria,
    );

    const novoProduto = Produto.criar({
      ...input,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    });

    return await this.produtoService.salvar(novoProduto);
  }
}
