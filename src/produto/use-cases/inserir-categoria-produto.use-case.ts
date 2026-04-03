import { Injectable } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { CategoriaProdutoService } from '@produto/services';

export interface InserirCategoriaProdutoInput {
  nome: string;
  idAscendente?: number;
}

@Injectable()
export class InserirCategoriaProdutoUseCase {
  constructor(
    private readonly categoriaProdutoService: CategoriaProdutoService,
  ) {}

  async execute(
    input: InserirCategoriaProdutoInput,
  ): Promise<CategoriaProduto> {
    if (input.idAscendente !== undefined) {
      await this.categoriaProdutoService.garantirExisteCategoria(
        input.idAscendente,
      );
    }

    const categoria = new CategoriaProduto();
    categoria.nome = input.nome;
    categoria.idAscendente = input.idAscendente;

    return this.categoriaProdutoService.salvarCategoria(categoria);
  }
}
