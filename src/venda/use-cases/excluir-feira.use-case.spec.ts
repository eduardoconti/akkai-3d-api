import { FeiraService } from '@venda/services';
import { ExcluirFeiraUseCase } from './excluir-feira.use-case';

describe('ExcluirFeiraUseCase', () => {
  it('deve garantir a feira antes de excluir', async () => {
    const feiraService = {
      garantirFeiraPorId: jest.fn().mockResolvedValue({ id: 1 }),
      excluirFeira: jest.fn().mockResolvedValue(undefined),
    } as unknown as FeiraService;

    const useCase = new ExcluirFeiraUseCase(feiraService);

    await useCase.execute({ id: 1 });

    expect(feiraService.garantirFeiraPorId).toHaveBeenCalledWith(1);
    expect(feiraService.excluirFeira).toHaveBeenCalledWith(1);
  });
});
