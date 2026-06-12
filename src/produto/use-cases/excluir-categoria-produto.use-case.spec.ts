import { CategoriaProdutoService } from '@produto/services';
import { ExcluirCategoriaProdutoUseCase } from './excluir-categoria-produto.use-case';

describe('ExcluirCategoriaProdutoUseCase', () => {
  it('deve garantir a categoria antes de excluir', async () => {
    const garantirCategoriaPorIdMock = jest.fn().mockResolvedValue({ id: 1 });
    const excluirCategoriaMock = jest.fn().mockResolvedValue(undefined);
    const categoriaProdutoService = {
      garantirCategoriaPorId: garantirCategoriaPorIdMock,
      excluirCategoria: excluirCategoriaMock,
    } as unknown as CategoriaProdutoService;

    const useCase = new ExcluirCategoriaProdutoUseCase(categoriaProdutoService);

    await useCase.execute({ id: 1 });

    expect(garantirCategoriaPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirCategoriaMock).toHaveBeenCalledWith(1);
  });
});
