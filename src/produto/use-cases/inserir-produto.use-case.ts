import { Injectable, NotFoundException } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

export interface InserirProdutoInput {
  nome: string;
  codigo: string;
  descricao?: string;
  idCategoria: number;
  valor: number;
}
@Injectable()
export class InserirProdutoUseCase {
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(input: InserirProdutoInput): Promise<Produto> {
    const categoriaExiste = await this.produtoService.existeCategoria(
      input.idCategoria,
    );

    if (!categoriaExiste) {
      throw new NotFoundException(
        `Categoria com ID ${input.idCategoria} não encontrada.`,
      );
    }

    const novoProduto = new Produto();
    novoProduto.nome = input.nome;
    novoProduto.codigo = input.codigo;
    novoProduto.descricao = input.descricao;
    novoProduto.idCategoria = input.idCategoria;
    novoProduto.valor = input.valor;

    return await this.produtoService.salvar(novoProduto);
  }
}
