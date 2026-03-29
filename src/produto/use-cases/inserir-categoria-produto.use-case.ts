import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

export interface InserirCategoriaProdutoInput {
  nome: string;
  idAscendente?: number;
}

@Injectable()
export class InserirCategoriaProdutoUseCase {
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(
    input: InserirCategoriaProdutoInput,
  ): Promise<CategoriaProduto> {
    if (input.idAscendente !== undefined) {
      const categoriaPaiExiste = await this.produtoService.existeCategoria(
        input.idAscendente,
      );

      if (!categoriaPaiExiste) {
        throw new NotFoundException(
          `Categoria ascendente com ID ${input.idAscendente} não encontrada.`,
        );
      }
    }

    const categoria = new CategoriaProduto();
    categoria.nome = input.nome;
    categoria.idAscendente = input.idAscendente;

    return this.produtoService.inserirCategoria(categoria);
  }
}
