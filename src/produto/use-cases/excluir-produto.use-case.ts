import { Injectable } from '@nestjs/common';
import { ProdutoService } from '@produto/services';

export interface ExcluirProdutoInput {
  id: number;
}

@Injectable()
export class ExcluirProdutoUseCase {
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(input: ExcluirProdutoInput): Promise<void> {
    await this.produtoService.garantirExisteProduto(input.id);
    await this.produtoService.excluirProduto(input.id);
  }
}
