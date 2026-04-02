import { Carteira } from '@financeiro/entities';
import { InserirCarteiraUseCase } from '@financeiro/use-cases';

describe('InserirCarteiraUseCase', () => {
  let useCase: InserirCarteiraUseCase;
  let financeiroService: {
    salvarCarteira: jest.Mock;
  };

  beforeEach(() => {
    financeiroService = {
      salvarCarteira: jest.fn(),
    };

    useCase = new InserirCarteiraUseCase(financeiroService as never);
  });

  it('deve inserir carteira com nome normalizado', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'NUBANK PIX',
      ativa: true,
    });
    financeiroService.salvarCarteira.mockResolvedValue(carteira);

    const result = await useCase.execute({
      nome: '  Nubank Pix ',
      ativa: true,
    });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'NUBANK PIX',
        ativa: true,
      }),
    );
    expect(result).toBe(carteira);
  });

  it('deve definir ativa como true quando não informado', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
    });
    financeiroService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({ nome: 'Caixa' });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({ ativa: true }),
    );
  });
});
