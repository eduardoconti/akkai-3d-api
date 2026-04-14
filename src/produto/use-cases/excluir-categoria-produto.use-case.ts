import { Injectable } from '@nestjs/common';
import { CategoriaProdutoService } from '@produto/services';

export interface ExcluirCategoriaProdutoInput {
  id: number;
}

@Injectable()
export class ExcluirCategoriaProdutoUseCase {
  constructor(
    private readonly categoriaProdutoService: CategoriaProdutoService,
  ) {}

  async execute(input: ExcluirCategoriaProdutoInput): Promise<void> {
    await this.categoriaProdutoService.garantirCategoriaPorId(input.id);
    await this.categoriaProdutoService.excluirCategoria(input.id);
  }
}
