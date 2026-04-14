import { NotFoundException } from '@nestjs/common';
import { AlterarDespesaUseCase } from './alterar-despesa.use-case';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import { Despesa } from '@financeiro/entities';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { FeiraService } from '@venda/services';

describe('AlterarDespesaUseCase', () => {
  let useCase: AlterarDespesaUseCase;
  let despesaService: {
    garantirDespesaPorId: jest.Mock;
    alterarDespesa: jest.Mock;
  };
  let carteiraService: { garantirExisteCarteira: jest.Mock };
  let categoriaDespesaService: { garantirExisteCategoriaDespesa: jest.Mock };
  let feiraService: { garantirExisteFeira: jest.Mock };

  const inputPadrao = {
    dataLancamento: '2026-04-01',
    descricao: 'Filamento PLA',
    valor: 3500,
    idCategoria: 1,
    meioPagamento: MeioPagamento.PIX,
    idCarteira: 2,
    idFeira: 4,
    observacao: 'Reposição',
  };

  beforeEach(() => {
    despesaService = {
      garantirDespesaPorId: jest.fn(),
      alterarDespesa: jest.fn(),
    };
    carteiraService = { garantirExisteCarteira: jest.fn() };
    categoriaDespesaService = { garantirExisteCategoriaDespesa: jest.fn() };
    feiraService = { garantirExisteFeira: jest.fn() };

    useCase = new AlterarDespesaUseCase(
      despesaService as unknown as DespesaService,
      carteiraService as unknown as CarteiraService,
      categoriaDespesaService as unknown as CategoriaDespesaService,
      feiraService as unknown as FeiraService,
    );
  });

  it('deve alterar despesa quando ela existir e a carteira e categoria forem válidas', async () => {
    const despesaExistente = Object.assign(new Despesa(), { id: 5 });
    const despesaAlterada = Object.assign(new Despesa(), {
      id: 5,
      descricao: 'Filamento PLA',
      valor: 3500,
    });

    despesaService.garantirDespesaPorId.mockResolvedValue(despesaExistente);
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    categoriaDespesaService.garantirExisteCategoriaDespesa.mockResolvedValue(
      undefined,
    );
    feiraService.garantirExisteFeira.mockResolvedValue(undefined);
    despesaService.alterarDespesa.mockResolvedValue(despesaAlterada);

    const result = await useCase.execute({ id: 5, ...inputPadrao });

    expect(despesaService.garantirDespesaPorId).toHaveBeenCalledWith(5);
    expect(carteiraService.garantirExisteCarteira).toHaveBeenCalledWith(2);
    expect(
      categoriaDespesaService.garantirExisteCategoriaDespesa,
    ).toHaveBeenCalledWith(1);
    expect(feiraService.garantirExisteFeira).toHaveBeenCalledWith(4);
    expect(despesaService.alterarDespesa).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        descricao: 'Filamento PLA',
        valor: 3500,
        idCategoria: 1,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
        idFeira: 4,
        observacao: 'Reposição',
      }),
    );
    expect(result).toBe(despesaAlterada);
  });

  it('deve definir observacao como undefined quando não informada', async () => {
    const despesaExistente = Object.assign(new Despesa(), { id: 5 });
    despesaService.garantirDespesaPorId.mockResolvedValue(despesaExistente);
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    categoriaDespesaService.garantirExisteCategoriaDespesa.mockResolvedValue(
      undefined,
    );
    feiraService.garantirExisteFeira.mockResolvedValue(undefined);
    despesaService.alterarDespesa.mockResolvedValue(despesaExistente);

    await useCase.execute({ id: 5, ...inputPadrao, observacao: undefined });

    expect(despesaService.alterarDespesa).toHaveBeenCalledWith(
      expect.objectContaining({ observacao: undefined }),
    );
  });

  it('deve lançar NotFoundException quando a despesa não existir', async () => {
    despesaService.garantirDespesaPorId.mockRejectedValue(
      new NotFoundException('Despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute({ id: 99, ...inputPadrao })).rejects.toThrow(
      NotFoundException,
    );

    expect(carteiraService.garantirExisteCarteira).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando a carteira não existir', async () => {
    despesaService.garantirDespesaPorId.mockResolvedValue(
      Object.assign(new Despesa(), { id: 5 }),
    );
    carteiraService.garantirExisteCarteira.mockRejectedValue(
      new NotFoundException('Carteira com ID 2 não encontrada.'),
    );

    await expect(useCase.execute({ id: 5, ...inputPadrao })).rejects.toThrow(
      NotFoundException,
    );

    expect(despesaService.alterarDespesa).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando a categoria não existir', async () => {
    despesaService.garantirDespesaPorId.mockResolvedValue(
      Object.assign(new Despesa(), { id: 5 }),
    );
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    categoriaDespesaService.garantirExisteCategoriaDespesa.mockRejectedValue(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute({ id: 5, ...inputPadrao })).rejects.toThrow(
      NotFoundException,
    );

    expect(despesaService.alterarDespesa).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando a feira não existir', async () => {
    despesaService.garantirDespesaPorId.mockResolvedValue(
      Object.assign(new Despesa(), { id: 5 }),
    );
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    categoriaDespesaService.garantirExisteCategoriaDespesa.mockResolvedValue(
      undefined,
    );
    feiraService.garantirExisteFeira.mockRejectedValue(
      new NotFoundException('Feira com ID 77 não encontrada.'),
    );

    await expect(
      useCase.execute({ id: 5, ...inputPadrao, idFeira: 77 }),
    ).rejects.toThrow(NotFoundException);

    expect(despesaService.alterarDespesa).not.toHaveBeenCalled();
  });
});
