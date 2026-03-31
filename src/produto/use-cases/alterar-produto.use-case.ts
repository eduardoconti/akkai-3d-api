import { Injectable, NotFoundException } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

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
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(id: number, input: AlterarProdutoInput): Promise<Produto> {
    const produto = await this.produtoService.obterProdutoPorId(id);

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const categoriaExiste = await this.produtoService.existeCategoria(
      input.idCategoria,
    );

    if (!categoriaExiste) {
      throw new NotFoundException(
        `Categoria com ID ${input.idCategoria} não encontrada.`,
      );
    }

    produto.nome = input.nome;
    produto.codigo = input.codigo;
    produto.descricao = input.descricao;
    produto.estoqueMinimo = input.estoqueMinimo;
    produto.idCategoria = input.idCategoria;
    produto.valor = input.valor;

    return await this.produtoService.salvar(produto);
  }
}
