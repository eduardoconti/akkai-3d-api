import { CarteiraService } from '@financeiro/services';
import { ExcluirCarteiraUseCase } from './excluir-carteira.use-case';

describe('ExcluirCarteiraUseCase', () => {
  it('deve garantir a carteira antes de excluir', async () => {
    const carteiraService = {
      garantirCarteiraPorId: jest.fn().mockResolvedValue({ id: 1 }),
      excluirCarteira: jest.fn().mockResolvedValue(undefined),
    } as unknown as CarteiraService;

    const useCase = new ExcluirCarteiraUseCase(carteiraService);

    await useCase.execute({ id: 1 });

    expect(carteiraService.garantirCarteiraPorId).toHaveBeenCalledWith(1);
    expect(carteiraService.excluirCarteira).toHaveBeenCalledWith(1);
  });
});
