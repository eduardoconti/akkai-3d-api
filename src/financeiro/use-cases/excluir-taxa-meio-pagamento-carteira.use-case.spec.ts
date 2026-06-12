import { TaxaMeioPagamentoCarteiraService } from '@financeiro/services';
import { ExcluirTaxaMeioPagamentoCarteiraUseCase } from './excluir-taxa-meio-pagamento-carteira.use-case';

describe('ExcluirTaxaMeioPagamentoCarteiraUseCase', () => {
  it('deve excluir taxa por id', async () => {
    const excluirTaxaMeioPagamentoCarteiraMock = jest
      .fn()
      .mockResolvedValue(undefined);
    const taxaService = {
      excluirTaxaMeioPagamentoCarteira: excluirTaxaMeioPagamentoCarteiraMock,
    } as unknown as TaxaMeioPagamentoCarteiraService;

    const useCase = new ExcluirTaxaMeioPagamentoCarteiraUseCase(taxaService);

    await useCase.execute({ id: 1 });

    expect(excluirTaxaMeioPagamentoCarteiraMock).toHaveBeenCalledWith(1);
  });
});
