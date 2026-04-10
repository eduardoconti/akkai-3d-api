import { NotFoundException } from '@nestjs/common';
import { AlterarDespesaUseCase } from './alterar-despesa.use-case';
import { FinanceiroService } from '@financeiro/services';
import { Despesa } from '@financeiro/entities';
import { MeioPagamento } from '@venda/entities';

describe('AlterarDespesaUseCase', () => {
  let useCase: AlterarDespesaUseCase;
  let financeiroService: {
    garantirDespesaPorId: jest.Mock;
    garantirExisteCarteira: jest.Mock;
    garantirExisteCategoriaDespesa: jest.Mock;
    alterarDespesa: jest.Mock;
  };

  const inputPadrao = {
    dataLancamento: '2026-04-01',
    descricao: 'Filamento PLA',
    valor: 3500,
    idCategoria: 1,
    meioPagamento: MeioPagamento.PIX,
    idCarteira: 2,
    observacao: 'Reposição',
  };

  beforeEach(() => {
    financeiroService = {
      garantirDespesaPorId: jest.fn(),
      garantirExisteCarteira: jest.fn(),
      garantirExisteCategoriaDespesa: jest.fn(),
      alterarDespesa: jest.fn(),
    };

    useCase = new AlterarDespesaUseCase(
      financeiroService as unknown as FinanceiroService,
    );
  });

  it('deve alterar despesa quando ela existir e a carteira e categoria forem válidas', async () => {
    const despesaExistente = Object.assign(new Despesa(), { id: 5 });
    const despesaAlterada = Object.assign(new Despesa(), {
      id: 5,
      descricao: 'Filamento PLA',
      valor: 3500,
    });

    financeiroService.garantirDespesaPorId.mockResolvedValue(despesaExistente);
    financeiroService.garantirExisteCarteira.mockResolvedValue(undefined);
    financeiroService.garantirExisteCategoriaDespesa.mockResolvedValue(undefined);
    financeiroService.alterarDespesa.mockResolvedValue(despesaAlterada);

    const result = await useCase.execute(5, inputPadrao);

    expect(financeiroService.garantirDespesaPorId).toHaveBeenCalledWith(5);
    expect(financeiroService.garantirExisteCarteira).toHaveBeenCalledWith(2);
    expect(financeiroService.garantirExisteCategoriaDespesa).toHaveBeenCalledWith(1);
    expect(financeiroService.alterarDespesa).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        descricao: 'Filamento PLA',
        valor: 3500,
        idCategoria: 1,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
        observacao: 'Reposição',
      }),
    );
    expect(result).toBe(despesaAlterada);
  });

  it('deve definir observacao como undefined quando não informada', async () => {
    const despesaExistente = Object.assign(new Despesa(), { id: 5 });
    financeiroService.garantirDespesaPorId.mockResolvedValue(despesaExistente);
    financeiroService.garantirExisteCarteira.mockResolvedValue(undefined);
    financeiroService.garantirExisteCategoriaDespesa.mockResolvedValue(undefined);
    financeiroService.alterarDespesa.mockResolvedValue(despesaExistente);

    await useCase.execute(5, { ...inputPadrao, observacao: undefined });

    expect(financeiroService.alterarDespesa).toHaveBeenCalledWith(
      expect.objectContaining({ observacao: undefined }),
    );
  });

  it('deve lançar NotFoundException quando a despesa não existir', async () => {
    financeiroService.garantirDespesaPorId.mockRejectedValue(
      new NotFoundException('Despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute(99, inputPadrao)).rejects.toThrow(
      NotFoundException,
    );

    expect(financeiroService.garantirExisteCarteira).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando a carteira não existir', async () => {
    financeiroService.garantirDespesaPorId.mockResolvedValue(
      Object.assign(new Despesa(), { id: 5 }),
    );
    financeiroService.garantirExisteCarteira.mockRejectedValue(
      new NotFoundException('Carteira com ID 2 não encontrada.'),
    );

    await expect(useCase.execute(5, inputPadrao)).rejects.toThrow(
      NotFoundException,
    );

    expect(financeiroService.alterarDespesa).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando a categoria não existir', async () => {
    financeiroService.garantirDespesaPorId.mockResolvedValue(
      Object.assign(new Despesa(), { id: 5 }),
    );
    financeiroService.garantirExisteCarteira.mockResolvedValue(undefined);
    financeiroService.garantirExisteCategoriaDespesa.mockRejectedValue(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute(5, inputPadrao)).rejects.toThrow(
      NotFoundException,
    );

    expect(financeiroService.alterarDespesa).not.toHaveBeenCalled();
  });
});
