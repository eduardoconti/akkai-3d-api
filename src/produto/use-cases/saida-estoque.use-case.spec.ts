import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { OrigemMovimentacaoEstoque } from '@produto/entities';
import { EstoqueService } from '@produto/services';
import { SaidaEstoqueUseCase } from '@produto/use-cases';

describe('SaidaEstoqueUseCase', () => {
  let useCase: SaidaEstoqueUseCase;
  let saidaEstoqueMock: jest.Mock;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    saidaEstoqueMock = jest.fn();
    currentUserContext = { usuarioId: 7 };

    useCase = new SaidaEstoqueUseCase(
      { saidaEstoque: saidaEstoqueMock } as unknown as EstoqueService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve delegar saída de estoque com o id do usuario logado', async () => {
    saidaEstoqueMock.mockResolvedValue(undefined);

    await useCase.execute({
      idProduto: 1,
      quantidade: 3,
      origem: OrigemMovimentacaoEstoque.AJUSTE,
    });

    expect(saidaEstoqueMock).toHaveBeenCalledWith(
      1,
      3,
      OrigemMovimentacaoEstoque.AJUSTE,
      7,
    );
  });

  it('deve usar o id do usuario do contexto atual', async () => {
    currentUserContext.usuarioId = 99;
    saidaEstoqueMock.mockResolvedValue(undefined);

    await useCase.execute({
      idProduto: 5,
      quantidade: 2,
      origem: OrigemMovimentacaoEstoque.PERDA,
    });

    expect(saidaEstoqueMock).toHaveBeenCalledWith(
      5,
      2,
      OrigemMovimentacaoEstoque.PERDA,
      99,
    );
  });
});
