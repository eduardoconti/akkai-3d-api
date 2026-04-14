import { CategoriaDespesa } from '@financeiro/entities';
import { InserirCategoriaDespesaUseCase } from '@financeiro/use-cases';
import { CategoriaDespesaService } from '@financeiro/services';

describe('InserirCategoriaDespesaUseCase', () => {
  let useCase: InserirCategoriaDespesaUseCase;
  let salvarCategoriaDespesaMock: jest.Mock;

  beforeEach(() => {
    salvarCategoriaDespesaMock = jest.fn();

    const categoriaDespesaService = {
      salvarCategoriaDespesa: salvarCategoriaDespesaMock,
    } as unknown as CategoriaDespesaService;

    useCase = new InserirCategoriaDespesaUseCase(categoriaDespesaService);
  });

  it('deve criar e salvar categoria de despesa com nome fornecido', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Matéria-prima',
    });
    salvarCategoriaDespesaMock.mockResolvedValue(categoria);

    const result = await useCase.execute({ nome: 'Matéria-prima' });

    expect(salvarCategoriaDespesaMock).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Matéria-prima' }),
    );
    expect(result).toBe(categoria);
  });
});
