import { CategoriaProdutoService } from '@produto/services';
import { ExcluirCategoriaProdutoUseCase } from './excluir-categoria-produto.use-case';

describe('ExcluirCategoriaProdutoUseCase', () => {
  it('deve garantir a categoria antes de excluir', async () => {
    const categoriaProdutoService = {
      garantirCategoriaPorId: jest.fn().mockResolvedValue({ id: 1 }),
      excluirCategoria: jest.fn().mockResolvedValue(undefined),
    } as unknown as CategoriaProdutoService;

    const useCase = new ExcluirCategoriaProdutoUseCase(categoriaProdutoService);

    await useCase.execute({ id: 1 });

    expect(categoriaProdutoService.garantirCategoriaPorId).toHaveBeenCalledWith(
      1,
    );
    expect(categoriaProdutoService.excluirCategoria).toHaveBeenCalledWith(1);
  });
});
