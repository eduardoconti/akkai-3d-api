import { NotFoundException } from '@nestjs/common';
import { ExcluirDespesaUseCase } from './excluir-despesa.use-case';
import { DespesaService } from '@financeiro/services';
import { Despesa } from '@financeiro/entities';

describe('ExcluirDespesaUseCase', () => {
  let useCase: ExcluirDespesaUseCase;
  let despesaService: {
    garantirDespesaPorId: jest.Mock;
    excluirDespesa: jest.Mock;
  };

  beforeEach(() => {
    despesaService = {
      garantirDespesaPorId: jest.fn(),
      excluirDespesa: jest.fn(),
    };

    useCase = new ExcluirDespesaUseCase(
      despesaService as unknown as DespesaService,
    );
  });

  it('deve excluir despesa quando ela existir', async () => {
    const despesa = Object.assign(new Despesa(), { id: 7 });
    despesaService.garantirDespesaPorId.mockResolvedValue(despesa);
    despesaService.excluirDespesa.mockResolvedValue(undefined);

    await useCase.execute({ id: 7 });

    expect(despesaService.garantirDespesaPorId).toHaveBeenCalledWith(7);
    expect(despesaService.excluirDespesa).toHaveBeenCalledWith(7);
  });

  it('deve lançar NotFoundException quando a despesa não existir', async () => {
    despesaService.garantirDespesaPorId.mockRejectedValue(
      new NotFoundException('Despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(
      NotFoundException,
    );

    expect(despesaService.excluirDespesa).not.toHaveBeenCalled();
  });
});
