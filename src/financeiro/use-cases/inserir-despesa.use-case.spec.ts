import { NotFoundException } from '@nestjs/common';
import { FinanceiroService } from '@financeiro/services';
import { InserirDespesaUseCase } from '@financeiro/use-cases';
import { CategoriaDespesa, Despesa } from '@financeiro/entities';
import { MeioPagamento } from '@venda/entities';

describe('InserirDespesaUseCase', () => {
  let useCase: InserirDespesaUseCase;
  let existeCarteiraMock: jest.MockedFunction<
    (idCarteira: number) => Promise<boolean>
  >;
  let inserirDespesaMock: jest.MockedFunction<
    (despesa: Despesa) => Promise<Despesa>
  >;

  beforeEach(() => {
    existeCarteiraMock = jest.fn<Promise<boolean>, [number]>();
    inserirDespesaMock = jest.fn<Promise<Despesa>, [Despesa]>();

    const financeiroService: Pick<
      FinanceiroService,
      'existeCarteira' | 'inserirDespesa'
    > = {
      existeCarteira: existeCarteiraMock,
      inserirDespesa: inserirDespesaMock,
    };

    useCase = new InserirDespesaUseCase(financeiroService as FinanceiroService);
  });

  it('deve inserir despesa quando a carteira existir', async () => {
    const despesaPersistida = Object.assign(new Despesa(), { id: 1 });
    existeCarteiraMock.mockResolvedValue(true);
    inserirDespesaMock.mockResolvedValue(despesaPersistida);

    const result = await useCase.execute({
      dataLancamento: '2026-03-31',
      descricao: 'Filamento PLA',
      valor: 3500,
      categoria: CategoriaDespesa.MATERIA_PRIMA,
      meioPagamento: MeioPagamento.PIX,
      idCarteira: 2,
      observacao: 'Reposição',
    });

    expect(existeCarteiraMock).toHaveBeenCalledWith(2);
    expect(inserirDespesaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: 'Filamento PLA',
        valor: 3500,
        categoria: CategoriaDespesa.MATERIA_PRIMA,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
        observacao: 'Reposição',
      }),
    );
    expect(result).toBe(despesaPersistida);
  });

  it('deve lançar erro quando a carteira não existir', async () => {
    existeCarteiraMock.mockResolvedValue(false);

    await expect(
      useCase.execute({
        dataLancamento: '2026-03-31',
        descricao: 'Filamento PLA',
        valor: 3500,
        categoria: CategoriaDespesa.MATERIA_PRIMA,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
