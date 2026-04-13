import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { CategoriaProdutoService } from '@produto/services';

export interface AlterarCategoriaProdutoInput {
  id: number;
  nome: string;
  idAscendente?: number;
}

@Injectable()
export class AlterarCategoriaProdutoUseCase {
  constructor(
    private readonly categoriaProdutoService: CategoriaProdutoService,
  ) {}

  async execute(
    input: AlterarCategoriaProdutoInput,
  ): Promise<CategoriaProduto> {
    const categoria = await this.categoriaProdutoService.garantirCategoriaPorId(
      input.id,
    );

    if (input.idAscendente !== undefined) {
      if (input.idAscendente === input.id) {
        throw new BadRequestException(
          'A categoria não pode ser definida como ascendente dela mesma.',
        );
      }

      await this.categoriaProdutoService.garantirExisteCategoria(
        input.idAscendente,
      );
    }

    categoria.nome = input.nome;
    categoria.idAscendente = input.idAscendente;

    return this.categoriaProdutoService.salvarCategoria(categoria);
  }
}
