import { TaxaMeioPagamentoCarteiraService } from '@financeiro/services';
import { ExcluirTaxaMeioPagamentoCarteiraUseCase } from './excluir-taxa-meio-pagamento-carteira.use-case';

describe('ExcluirTaxaMeioPagamentoCarteiraUseCase', () => {
  it('deve excluir taxa por id', async () => {
    const taxaService = {
      excluirTaxaMeioPagamentoCarteira: jest.fn().mockResolvedValue(undefined),
    } as unknown as TaxaMeioPagamentoCarteiraService;

    const useCase = new ExcluirTaxaMeioPagamentoCarteiraUseCase(taxaService);

    await useCase.execute({ id: 1 });

    expect(taxaService.excluirTaxaMeioPagamentoCarteira).toHaveBeenCalledWith(
      1,
    );
  });
});
