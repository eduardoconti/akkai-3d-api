import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ExcluirProdutoUseCase } from './excluir-produto.use-case';

describe('ExcluirProdutoUseCase', () => {
  it('deve garantir que o produto existe antes de excluir', async () => {
    const produto = Object.assign(new Produto(), { id: 1 });
    const garantirExisteProdutoMock = jest.fn().mockResolvedValue(produto);
    const excluirProdutoMock = jest.fn().mockResolvedValue(undefined);
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
      excluirProduto: excluirProdutoMock,
    } as unknown as ProdutoService;

    const useCase = new ExcluirProdutoUseCase(produtoService);

    await useCase.execute({ id: 1 });

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(excluirProdutoMock).toHaveBeenCalledWith(1);
  });
});
