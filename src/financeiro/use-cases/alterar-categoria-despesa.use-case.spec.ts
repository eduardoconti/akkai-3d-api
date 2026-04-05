import { NotFoundException } from '@nestjs/common';
import { CategoriaDespesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
import { AlterarCategoriaDespesaUseCase } from '@financeiro/use-cases';

describe('AlterarCategoriaDespesaUseCase', () => {
  let useCase: AlterarCategoriaDespesaUseCase;
  let garantirCategoriaDespesaPorIdMock: jest.Mock;
  let salvarCategoriaDespesaMock: jest.Mock;

  beforeEach(() => {
    garantirCategoriaDespesaPorIdMock = jest.fn();
    salvarCategoriaDespesaMock = jest.fn();

    const financeiroService = {
      garantirCategoriaDespesaPorId: garantirCategoriaDespesaPorIdMock,
      salvarCategoriaDespesa: salvarCategoriaDespesaMock,
    } as unknown as FinanceiroService;

    useCase = new AlterarCategoriaDespesaUseCase(financeiroService);
  });

  it('deve alterar nome da categoria de despesa', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Embalagem',
    });
    const categoriaAtualizada = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Embalagem Premium',
    });
    garantirCategoriaDespesaPorIdMock.mockResolvedValue(categoria);
    salvarCategoriaDespesaMock.mockResolvedValue(categoriaAtualizada);

    const result = await useCase.execute(1, { nome: 'Embalagem Premium' });

    expect(garantirCategoriaDespesaPorIdMock).toHaveBeenCalledWith(1);
    expect(salvarCategoriaDespesaMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, nome: 'Embalagem Premium' }),
    );
    expect(result).toBe(categoriaAtualizada);
  });

  it('deve lançar NotFoundException quando categoria não existir', async () => {
    garantirCategoriaDespesaPorIdMock.mockRejectedValue(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );

    await expect(useCase.execute(99, { nome: 'Qualquer' })).rejects.toThrow(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );
  });
});
