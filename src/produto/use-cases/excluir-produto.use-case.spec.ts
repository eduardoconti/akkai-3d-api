import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ExcluirProdutoUseCase } from './excluir-produto.use-case';

describe('ExcluirProdutoUseCase', () => {
  it('deve obter detalhe do produto antes de excluir', async () => {
    const produto = Object.assign(new Produto(), { id: 1 });
    const obterDetalheProdutoPorIdMock = jest.fn().mockResolvedValue(produto);
    const excluirProdutoMock = jest.fn().mockResolvedValue(undefined);
    const produtoService = {
      obterDetalheProdutoPorId: obterDetalheProdutoPorIdMock,
      excluirProduto: excluirProdutoMock,
    } as unknown as ProdutoService;

    const useCase = new ExcluirProdutoUseCase(produtoService);

    await useCase.execute({ id: 1 });

    expect(obterDetalheProdutoPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirProdutoMock).toHaveBeenCalledWith(1);
  });
});
