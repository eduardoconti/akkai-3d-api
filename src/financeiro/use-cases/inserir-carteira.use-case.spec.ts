import { Carteira } from '@financeiro/entities';
import { InserirCarteiraUseCase } from '@financeiro/use-cases';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CarteiraService } from '@financeiro/services';

describe('InserirCarteiraUseCase', () => {
  let useCase: InserirCarteiraUseCase;
  let carteiraService: {
    salvarCarteira: jest.Mock;
  };

  beforeEach(() => {
    carteiraService = {
      salvarCarteira: jest.fn(),
    };

    useCase = new InserirCarteiraUseCase(
      carteiraService as unknown as CarteiraService,
    );
  });

  it('deve inserir carteira com nome fornecido pelo DTO', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'NUBANK PIX',
      ativa: true,
      meiosPagamento: [],
    });
    carteiraService.salvarCarteira.mockResolvedValue(carteira);

    const result = await useCase.execute({
      nome: 'NUBANK PIX',
      ativa: true,
    });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'NUBANK PIX',
        ativa: true,
        meiosPagamento: [],
      }),
    );
    expect(result).toBe(carteira);
  });

  it('deve definir ativa como true quando não informado', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
      ativa: true,
      meiosPagamento: [],
    });
    carteiraService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({ nome: 'CAIXA' });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({ ativa: true, meiosPagamento: [] }),
    );
  });

  it('deve salvar meios de pagamento informados', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'NUBANK',
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DEB],
    });
    carteiraService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({
      nome: 'NUBANK',
      meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DEB],
    });

    expect(carteiraService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DEB],
      }),
    );
  });
});
