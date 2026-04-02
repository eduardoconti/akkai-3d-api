import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

export interface AlterarCategoriaProdutoInput {
  nome: string;
  idAscendente?: number;
}

@Injectable()
export class AlterarCategoriaProdutoUseCase {
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(
    id: number,
    input: AlterarCategoriaProdutoInput,
  ): Promise<CategoriaProduto> {
    const categoria = await this.produtoService.obterCategoriaPorId(id);

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }

    if (input.idAscendente !== undefined) {
      if (input.idAscendente === id) {
        throw new BadRequestException(
          'A categoria não pode ser definida como ascendente dela mesma.',
        );
      }

      const categoriaPaiExiste = await this.produtoService.existeCategoria(
        input.idAscendente,
      );

      if (!categoriaPaiExiste) {
        throw new NotFoundException(
          `Categoria ascendente com ID ${input.idAscendente} não encontrada.`,
        );
      }
    }

    categoria.nome = input.nome;
    categoria.idAscendente = input.idAscendente;

    return this.produtoService.salvarCategoria(categoria);
  }
}
