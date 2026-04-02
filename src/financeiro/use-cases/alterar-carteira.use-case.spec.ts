import { NotFoundException } from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { AlterarCarteiraUseCase } from '@financeiro/use-cases';

describe('AlterarCarteiraUseCase', () => {
  let useCase: AlterarCarteiraUseCase;
  let financeiroService: {
    obterCarteiraPorId: jest.Mock;
    salvarCarteira: jest.Mock;
  };

  beforeEach(() => {
    financeiroService = {
      obterCarteiraPorId: jest.fn(),
      salvarCarteira: jest.fn(),
    };

    useCase = new AlterarCarteiraUseCase(financeiroService as never);
  });

  it('deve alterar uma carteira existente', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
    });

    financeiroService.obterCarteiraPorId.mockResolvedValue(carteira);
    financeiroService.salvarCarteira.mockResolvedValue({
      ...carteira,
      nome: 'NUBANK PIX',
      ativa: false,
    });

    const result = await useCase.execute(1, {
      nome: 'Nubank Pix',
      ativa: false,
    });

    expect(financeiroService.obterCarteiraPorId).toHaveBeenCalledWith(1);
    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        nome: 'NUBANK PIX',
        ativa: false,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        nome: 'NUBANK PIX',
        ativa: false,
      }),
    );
  });

  it('deve lançar erro quando carteira não existir', async () => {
    financeiroService.obterCarteiraPorId.mockResolvedValue(null);

    await expect(
      useCase.execute(99, {
        nome: 'Carteira teste',
      }),
    ).rejects.toThrow(new NotFoundException('Carteira não encontrada'));
  });

  it('deve manter ativa original quando ativa não for informado', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
    });
    financeiroService.obterCarteiraPorId.mockResolvedValue(carteira);
    financeiroService.salvarCarteira.mockResolvedValue({
      ...carteira,
      nome: 'NUBANK',
    });

    await useCase.execute(1, { nome: 'Nubank' });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({ ativa: true }),
    );
  });
});
