import { Injectable } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { StatusProduto } from '@produto/enums';
import { ProdutoService } from '@produto/services';

export interface AlterarStatusProdutoInput {
  id: number;
  status: StatusProduto;
}

@Injectable()
export class AlterarStatusProdutoUseCase {
  constructor(private readonly produtoService: ProdutoService) {}

  async execute(input: AlterarStatusProdutoInput): Promise<Produto> {
    const produto = await this.produtoService.garantirExisteProduto(input.id);

    produto.alterarStatus(input.status);

    return this.produtoService.salvar(produto);
  }
}
