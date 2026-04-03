import { Injectable } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';

export interface AlterarProdutoInput {
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

  async execute(id: number, input: AlterarProdutoInput): Promise<Produto> {
    const produto = await this.produtoService.garantirExisteProduto(id);

    await this.categoriaProdutoService.garantirExisteCategoria(
      input.idCategoria,
    );

    produto.nome = input.nome;
    produto.codigo = input.codigo;
    produto.descricao = input.descricao;
    produto.estoqueMinimo = input.estoqueMinimo;
    produto.idCategoria = input.idCategoria;
    produto.valor = input.valor;

    return await this.produtoService.salvar(produto);
  }
}
