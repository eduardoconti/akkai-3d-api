import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ExcluirProdutoUseCase } from './excluir-produto.use-case';

describe('ExcluirProdutoUseCase', () => {
  it('deve obter detalhe do produto antes de excluir', async () => {
    const produto = Object.assign(new Produto(), { id: 1 });
    const produtoService = {
      obterDetalheProdutoPorId: jest.fn().mockResolvedValue(produto),
      excluirProduto: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProdutoService;

    const useCase = new ExcluirProdutoUseCase(produtoService);

    await useCase.execute({ id: 1 });

    expect(produtoService.obterDetalheProdutoPorId).toHaveBeenCalledWith(1);
    expect(produtoService.excluirProduto).toHaveBeenCalledWith(1);
  });
});
