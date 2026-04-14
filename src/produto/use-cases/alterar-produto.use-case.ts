import { Injectable } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';

export interface AlterarProdutoInput {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  estoqueMinimo?: number;
  idCategoria: number;
  valor: number;
}

@Injectable()
export class AlterarProdutoUseCase {
  constructor(
    private readonly produtoService: ProdutoService,
    private readonly categoriaProdutoService: CategoriaProdutoService,
  ) {}

  async execute(input: AlterarProdutoInput): Promise<Produto> {
    const produto = await this.produtoService.garantirExisteProduto(input.id);

    await this.categoriaProdutoService.garantirExisteCategoria(
      input.idCategoria,
    );

    produto.atualizar(input);

    return await this.produtoService.salvar(produto);
  }
}
