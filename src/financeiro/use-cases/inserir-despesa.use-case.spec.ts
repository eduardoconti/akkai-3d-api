import { NotFoundException } from '@nestjs/common';
import { FinanceiroService } from '@financeiro/services';
import { InserirDespesaUseCase } from '@financeiro/use-cases';
import { CategoriaDespesa, Despesa } from '@financeiro/entities';
import { MeioPagamento } from '@venda/entities';

describe('InserirDespesaUseCase', () => {
  let useCase: InserirDespesaUseCase;
  let garantirExisteCarteiraMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let inserirDespesaMock: jest.MockedFunction<
    (despesa: Despesa) => Promise<Despesa>
  >;

  beforeEach(() => {
    garantirExisteCarteiraMock = jest.fn<Promise<void>, [number]>();
    inserirDespesaMock = jest.fn<Promise<Despesa>, [Despesa]>();

    const financeiroService = {
      garantirExisteCarteira: garantirExisteCarteiraMock,
      inserirDespesa: inserirDespesaMock,
    } as unknown as FinanceiroService;

    useCase = new InserirDespesaUseCase(financeiroService);
  });

  it('deve inserir despesa quando a carteira existir', async () => {
    const despesaPersistida = Object.assign(new Despesa(), { id: 1 });
    garantirExisteCarteiraMock.mockResolvedValue(undefined);
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

    expect(garantirExisteCarteiraMock).toHaveBeenCalledWith(2);
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
    garantirExisteCarteiraMock.mockRejectedValue(
      new NotFoundException('Carteira com ID 2 não encontrada.'),
    );

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
