import { NotFoundException } from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { AlterarCarteiraUseCase } from '@financeiro/use-cases';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CarteiraService } from '@financeiro/services';

describe('AlterarCarteiraUseCase', () => {
  let useCase: AlterarCarteiraUseCase;
  let carteiraService: {
    garantirCarteiraPorId: jest.Mock;
    salvarCarteira: jest.Mock;
  };

  beforeEach(() => {
    carteiraService = {
      garantirCarteiraPorId: jest.fn(),
      salvarCarteira: jest.fn(),
    };

    useCase = new AlterarCarteiraUseCase(
      carteiraService as unknown as CarteiraService,
    );
  });

  it('deve alterar uma carteira existente', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
      meiosPagamento: [],
    });

    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    carteiraService.salvarCarteira.mockResolvedValue({
      ...carteira,
      nome: 'NUBANK PIX',
      ativa: false,
    });

    const result = await useCase.execute({
      id: 1,
      nome: 'NUBANK PIX',
      ativa: false,
    });

    expect(carteiraService.garantirCarteiraPorId).toHaveBeenCalledWith(1);
    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
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

  it('deve atualizar meios de pagamento quando informados', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
      meiosPagamento: [],
    });

    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    carteiraService.salvarCarteira.mockResolvedValue({
      ...carteira,
      meiosPagamento: [MeioPagamento.PIX],
    });

    await useCase.execute({
      id: 1,
      nome: 'CAIXA',
      meiosPagamento: [MeioPagamento.PIX],
    });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({ meiosPagamento: [MeioPagamento.PIX] }),
    );
  });

  it('deve manter meios de pagamento originais quando não informados', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
      meiosPagamento: [MeioPagamento.DIN, MeioPagamento.PIX],
    });

    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    carteiraService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({ id: 1, nome: 'CAIXA' });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        meiosPagamento: [MeioPagamento.DIN, MeioPagamento.PIX],
      }),
    );
  });

  it('deve lançar erro quando carteira não existir', async () => {
    carteiraService.garantirCarteiraPorId.mockRejectedValue(
      new NotFoundException('Carteira não encontrada'),
    );

    await expect(
      useCase.execute({ id: 99, nome: 'Carteira teste' }),
    ).rejects.toThrow(new NotFoundException('Carteira não encontrada'));
  });

  it('deve manter ativa original quando ativa não for informado', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
    });
    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    carteiraService.salvarCarteira.mockResolvedValue({
      ...carteira,
      nome: 'NUBANK',
    });

    await useCase.execute({ id: 1, nome: 'NUBANK' });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({ ativa: true }),
    );
  });
});
