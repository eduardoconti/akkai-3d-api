import { NotFoundException } from '@nestjs/common';
import { ExcluirDespesaUseCase } from './excluir-despesa.use-case';
import { FinanceiroService } from '@financeiro/services';
import { Despesa } from '@financeiro/entities';

describe('ExcluirDespesaUseCase', () => {
  let useCase: ExcluirDespesaUseCase;
  let financeiroService: {
    garantirDespesaPorId: jest.Mock;
    excluirDespesa: jest.Mock;
  };

  beforeEach(() => {
    financeiroService = {
      garantirDespesaPorId: jest.fn(),
      excluirDespesa: jest.fn(),
    };

    useCase = new ExcluirDespesaUseCase(
      financeiroService as unknown as FinanceiroService,
    );
  });

  it('deve excluir despesa quando ela existir', async () => {
    const despesa = Object.assign(new Despesa(), { id: 7 });
    financeiroService.garantirDespesaPorId.mockResolvedValue(despesa);
    financeiroService.excluirDespesa.mockResolvedValue(undefined);

    await useCase.execute(7);

    expect(financeiroService.garantirDespesaPorId).toHaveBeenCalledWith(7);
    expect(financeiroService.excluirDespesa).toHaveBeenCalledWith(7);
  });

  it('deve lançar NotFoundException quando a despesa não existir', async () => {
    financeiroService.garantirDespesaPorId.mockRejectedValue(
      new NotFoundException('Despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute(99)).rejects.toThrow(NotFoundException);

    expect(financeiroService.excluirDespesa).not.toHaveBeenCalled();
  });
});
