import { AjusteCarteira, TipoAjusteCarteira } from '@financeiro/entities';
import { CarteiraService } from '@financeiro/services';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import {
  OrigemMovimentacaoEstoque,
  MovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import {
  TipoDiferencaTrocaDevolucao,
  TipoItemTrocaDevolucao,
  TrocaDevolucao,
} from '@venda/entities';
import { TrocaDevolucaoService } from '@venda/services';
import { InserirTrocaDevolucaoUseCase } from '@venda/use-cases';

type InserirTrocaDevolucaoFn = (
  trocaDevolucao: TrocaDevolucao,
  movimentacoesEstoque: MovimentacaoEstoque[],
  ajusteCarteira?: AjusteCarteira,
) => Promise<TrocaDevolucao>;

describe('InserirTrocaDevolucaoUseCase', () => {
  let useCase: InserirTrocaDevolucaoUseCase;
  let inserirTrocaDevolucaoMock: jest.MockedFunction<InserirTrocaDevolucaoFn>;
  let garantirExisteProdutoMock: jest.Mock;
  let garantirCarteiraAceitaMeioPagamentoMock: jest.Mock;

  beforeEach(() => {
    inserirTrocaDevolucaoMock = jest
      .fn<
        ReturnType<InserirTrocaDevolucaoFn>,
        Parameters<InserirTrocaDevolucaoFn>
      >()
      .mockImplementation((trocaDevolucao: TrocaDevolucao) =>
        Promise.resolve(trocaDevolucao),
      );
    garantirExisteProdutoMock = jest.fn().mockResolvedValue({ id: 1 });
    garantirCarteiraAceitaMeioPagamentoMock = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    useCase = new InserirTrocaDevolucaoUseCase(
      {
        inserirTrocaDevolucao: inserirTrocaDevolucaoMock,
      } as unknown as TrocaDevolucaoService,
      {
        garantirExisteProduto: garantirExisteProdutoMock,
      } as unknown as ProdutoService,
      {
        garantirCarteiraAceitaMeioPagamento:
          garantirCarteiraAceitaMeioPagamentoMock,
      } as unknown as CarteiraService,
      { usuarioId: 7 } as unknown as CurrentUserContext,
    );
  });

  function obterChamadaInserir(): Parameters<InserirTrocaDevolucaoFn> {
    const chamada = inserirTrocaDevolucaoMock.mock.calls[0];
    if (!chamada) {
      throw new Error('Inserção de troca/devolução não foi chamada.');
    }
    return chamada;
  }

  it('deve registrar troca com diferença a pagar', async () => {
    const result = await useCase.execute({
      dataTrocaDevolucao: '2026-06-22T10:00:00.000Z',
      idCarteira: 3,
      meioPagamento: MeioPagamento.PIX,
      observacao: 'Troca por tamanho maior',
      itens: [
        {
          idProduto: 10,
          tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
          quantidade: 1,
          valorUnitario: 1000,
        },
        {
          idProduto: 11,
          tipo: TipoItemTrocaDevolucao.ENTREGUE,
          quantidade: 1,
          valorUnitario: 1500,
        },
      ],
    });

    const [, movimentacoes, ajuste] = obterChamadaInserir();

    expect(result.tipoDiferenca).toBe(TipoDiferencaTrocaDevolucao.A_PAGAR);
    expect(result.valorDiferenca).toBe(500);
    expect(garantirCarteiraAceitaMeioPagamentoMock).toHaveBeenCalledWith(
      3,
      MeioPagamento.PIX,
    );
    expect(movimentacoes).toEqual([
      expect.objectContaining({
        idProduto: 10,
        quantidade: 1,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.DEVOLUCAO,
        idUsuarioInclusao: 7,
      }),
      expect.objectContaining({
        idProduto: 11,
        quantidade: 1,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.TROCA,
        idUsuarioInclusao: 7,
      }),
    ]);
    expect(ajuste).toEqual(
      expect.objectContaining({
        idCarteira: 3,
        tipo: TipoAjusteCarteira.CREDITO,
        valor: 500,
        motivo: 'Diferença de troca/devolução',
        idUsuarioInclusao: 7,
      }),
    );
  });

  it('deve registrar devolução com diferença a devolver', async () => {
    const result = await useCase.execute({
      dataTrocaDevolucao: '2026-06-22T10:00:00.000Z',
      idCarteira: 3,
      meioPagamento: MeioPagamento.DIN,
      itens: [
        {
          idProduto: 10,
          tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
    });

    const [, movimentacoes, ajuste] = obterChamadaInserir();
    const [movimentacao] = movimentacoes;

    expect(result.tipoDiferenca).toBe(TipoDiferencaTrocaDevolucao.A_DEVOLVER);
    expect(result.valorDiferenca).toBe(2000);
    expect(movimentacoes).toHaveLength(1);
    expect(movimentacao).toEqual(
      expect.objectContaining({
        idProduto: 10,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.DEVOLUCAO,
      }),
    );
    expect(ajuste).toEqual(
      expect.objectContaining({
        tipo: TipoAjusteCarteira.DEBITO,
        valor: 2000,
      }),
    );
  });

  it('não deve criar ajuste de carteira quando não há diferença', async () => {
    await useCase.execute({
      dataTrocaDevolucao: '2026-06-22T10:00:00.000Z',
      itens: [
        {
          idProduto: 10,
          tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
          quantidade: 1,
          valorUnitario: 1000,
        },
        {
          idProduto: 11,
          tipo: TipoItemTrocaDevolucao.ENTREGUE,
          quantidade: 1,
          valorUnitario: 1000,
        },
      ],
    });

    const [, , ajuste] = obterChamadaInserir();

    expect(garantirCarteiraAceitaMeioPagamentoMock).not.toHaveBeenCalled();
    expect(ajuste).toBeUndefined();
  });
});
