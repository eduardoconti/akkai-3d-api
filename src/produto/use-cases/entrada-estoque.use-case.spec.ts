import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { OrigemMovimentacaoEstoque } from '@produto/entities';
import { EstoqueService } from '@produto/services';
import { EntradaEstoqueUseCase } from '@produto/use-cases';

describe('EntradaEstoqueUseCase', () => {
  let useCase: EntradaEstoqueUseCase;
  let entradaEstoqueMock: jest.Mock;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    entradaEstoqueMock = jest.fn();
    currentUserContext = { usuarioId: 7 };

    useCase = new EntradaEstoqueUseCase(
      { entradaEstoque: entradaEstoqueMock } as unknown as EstoqueService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve delegar entrada de estoque com o id do usuario logado', async () => {
    entradaEstoqueMock.mockResolvedValue(undefined);

    await useCase.execute({
      idProduto: 1,
      quantidade: 5,
      origem: OrigemMovimentacaoEstoque.COMPRA,
    });

    expect(entradaEstoqueMock).toHaveBeenCalledWith(
      1,
      5,
      OrigemMovimentacaoEstoque.COMPRA,
      7,
    );
  });

  it('deve usar o id do usuario do contexto atual', async () => {
    currentUserContext.usuarioId = 42;
    entradaEstoqueMock.mockResolvedValue(undefined);

    await useCase.execute({
      idProduto: 2,
      quantidade: 10,
      origem: OrigemMovimentacaoEstoque.PRODUCAO,
    });

    expect(entradaEstoqueMock).toHaveBeenCalledWith(
      2,
      10,
      OrigemMovimentacaoEstoque.PRODUCAO,
      42,
    );
  });
});
