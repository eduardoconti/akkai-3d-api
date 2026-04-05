import { Carteira } from '@financeiro/entities';
import { InserirCarteiraUseCase } from '@financeiro/use-cases';
import { MeioPagamento } from '@venda/entities/meio-pagamento.enum';

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

  it('deve inserir carteira com nome fornecido pelo DTO', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'NUBANK PIX',
      ativa: true,
      meiosPagamento: [],
    });
    financeiroService.salvarCarteira.mockResolvedValue(carteira);

    const result = await useCase.execute({
      nome: 'NUBANK PIX',
      ativa: true,
    });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
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
    financeiroService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({ nome: 'CAIXA' });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
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
    financeiroService.salvarCarteira.mockResolvedValue(carteira);

    await useCase.execute({
      nome: 'NUBANK',
      meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DEB],
    });

    expect(financeiroService.salvarCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DEB],
      }),
    );
  });
});
