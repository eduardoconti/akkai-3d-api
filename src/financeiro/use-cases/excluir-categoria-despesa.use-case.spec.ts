import { CategoriaDespesaService } from '@financeiro/services';
import { ExcluirCategoriaDespesaUseCase } from './excluir-categoria-despesa.use-case';

describe('ExcluirCategoriaDespesaUseCase', () => {
  it('deve garantir a categoria antes de excluir', async () => {
    const categoriaDespesaService = {
      garantirCategoriaDespesaPorId: jest.fn().mockResolvedValue({ id: 1 }),
      excluirCategoriaDespesa: jest.fn().mockResolvedValue(undefined),
    } as unknown as CategoriaDespesaService;

    const useCase = new ExcluirCategoriaDespesaUseCase(categoriaDespesaService);

    await useCase.execute({ id: 1 });

    expect(
      categoriaDespesaService.garantirCategoriaDespesaPorId,
    ).toHaveBeenCalledWith(1);
    expect(
      categoriaDespesaService.excluirCategoriaDespesa,
    ).toHaveBeenCalledWith(1);
  });
});
