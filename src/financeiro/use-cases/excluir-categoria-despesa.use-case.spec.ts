import { CategoriaDespesaService } from '@financeiro/services';
import { ExcluirCategoriaDespesaUseCase } from './excluir-categoria-despesa.use-case';

describe('ExcluirCategoriaDespesaUseCase', () => {
  it('deve garantir a categoria antes de excluir', async () => {
    const garantirCategoriaDespesaPorIdMock = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    const excluirCategoriaDespesaMock = jest.fn().mockResolvedValue(undefined);
    const categoriaDespesaService = {
      garantirCategoriaDespesaPorId: garantirCategoriaDespesaPorIdMock,
      excluirCategoriaDespesa: excluirCategoriaDespesaMock,
    } as unknown as CategoriaDespesaService;

    const useCase = new ExcluirCategoriaDespesaUseCase(categoriaDespesaService);

    await useCase.execute({ id: 1 });

    expect(garantirCategoriaDespesaPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirCategoriaDespesaMock).toHaveBeenCalledWith(1);
  });
});
