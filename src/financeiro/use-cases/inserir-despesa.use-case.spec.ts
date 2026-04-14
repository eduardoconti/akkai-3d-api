import { NotFoundException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import { InserirDespesaUseCase } from '@financeiro/use-cases';
import { Despesa } from '@financeiro/entities';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

describe('InserirDespesaUseCase', () => {
  let useCase: InserirDespesaUseCase;
  let garantirExisteCarteiraMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let garantirExisteCategoriaDespesaMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let inserirDespesaMock: jest.MockedFunction<
    (despesa: Despesa) => Promise<Despesa>
  >;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    garantirExisteCarteiraMock = jest.fn<Promise<void>, [number]>();
    garantirExisteCategoriaDespesaMock = jest.fn<Promise<void>, [number]>();
    inserirDespesaMock = jest.fn<Promise<Despesa>, [Despesa]>();
    currentUserContext = { usuarioId: 7 };

    const despesaService = {
      inserirDespesa: inserirDespesaMock,
    } as unknown as DespesaService;

    const carteiraService = {
      garantirExisteCarteira: garantirExisteCarteiraMock,
    } as unknown as CarteiraService;

    const categoriaDespesaService = {
      garantirExisteCategoriaDespesa: garantirExisteCategoriaDespesaMock,
    } as unknown as CategoriaDespesaService;

    useCase = new InserirDespesaUseCase(
      despesaService,
      carteiraService,
      categoriaDespesaService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve inserir despesa quando a carteira e categoria existirem', async () => {
    const despesaPersistida = Object.assign(new Despesa(), { id: 1 });
    garantirExisteCarteiraMock.mockResolvedValue(undefined);
    garantirExisteCategoriaDespesaMock.mockResolvedValue(undefined);
    inserirDespesaMock.mockResolvedValue(despesaPersistida);

    const result = await useCase.execute({
      dataLancamento: '2026-03-31',
      descricao: 'Filamento PLA',
      valor: 3500,
      idCategoria: 1,
      meioPagamento: MeioPagamento.PIX,
      idCarteira: 2,
      observacao: 'Reposição',
    });

    expect(garantirExisteCarteiraMock).toHaveBeenCalledWith(2);
    expect(garantirExisteCategoriaDespesaMock).toHaveBeenCalledWith(1);
    expect(inserirDespesaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: 'Filamento PLA',
        valor: 3500,
        idCategoria: 1,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
        idUsuarioInclusao: 7,
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
        idCategoria: 1,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro quando a categoria não existir', async () => {
    garantirExisteCarteiraMock.mockResolvedValue(undefined);
    garantirExisteCategoriaDespesaMock.mockRejectedValue(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        dataLancamento: '2026-03-31',
        descricao: 'Filamento PLA',
        valor: 3500,
        idCategoria: 99,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
