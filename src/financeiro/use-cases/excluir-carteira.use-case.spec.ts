import { CarteiraService } from '@financeiro/services';
import { ExcluirCarteiraUseCase } from './excluir-carteira.use-case';

describe('ExcluirCarteiraUseCase', () => {
  it('deve garantir a carteira antes de excluir', async () => {
    const garantirCarteiraPorIdMock = jest.fn().mockResolvedValue({ id: 1 });
    const excluirCarteiraMock = jest.fn().mockResolvedValue(undefined);
    const carteiraService = {
      garantirCarteiraPorId: garantirCarteiraPorIdMock,
      excluirCarteira: excluirCarteiraMock,
    } as unknown as CarteiraService;

    const useCase = new ExcluirCarteiraUseCase(carteiraService);

    await useCase.execute({ id: 1 });

    expect(garantirCarteiraPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirCarteiraMock).toHaveBeenCalledWith(1);
  });
});
