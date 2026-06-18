import { NotFoundException } from '@nestjs/common';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { Produto, TipoMovimentacaoEstoque } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
  VendaService,
} from '@venda/services';
import {
  AlterarVendaUseCase,
  ExecutarAlterarVendaInput,
} from '@venda/use-cases';
import { CurrentUserContext } from '@common/services/current-user-context.service';

describe('AlterarVendaUseCase', () => {
  const dataVenda = '2026-04-01T12:00:00.000Z';

  let useCase: AlterarVendaUseCase;
  let alterarVendaMock: jest.Mock;
  let garantirExisteVendaMock: jest.Mock;
  let garantirExisteFeiraMock: jest.Mock;
  let garantirCarteiraAceitaMeioPagamentoMock: jest.Mock;
  let garantirExisteProdutoMock: jest.Mock;
  let obterTaxaAtivaPorCarteiraEMeioPagamentoMock: jest.Mock;
  let obterValorProdutoParaFeiraMock: jest.Mock;
  let currentUserContext: { usuarioId: number };

  const criarPagamentoInput = (
    valor: number,
    meioPagamento = MeioPagamento.PIX,
    idCarteira = 1,
  ) => ({
    idCarteira,
    meioPagamento,
    valor,
  });

  beforeEach(() => {
    alterarVendaMock = jest.fn();
    garantirExisteVendaMock = jest.fn();
    garantirExisteFeiraMock = jest.fn();
    garantirCarteiraAceitaMeioPagamentoMock = jest.fn();
    garantirExisteProdutoMock = jest.fn();
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock = jest.fn();
    obterValorProdutoParaFeiraMock = jest.fn(
      (_idFeira: number | undefined, produto: Produto) =>
        Promise.resolve(produto.valor),
    );
    currentUserContext = { usuarioId: 7 };

    const vendaService = {
      alterarVenda: alterarVendaMock,
      garantirExisteVenda: garantirExisteVendaMock,
    } as unknown as VendaService;
    const feiraService = {
      garantirExisteFeira: garantirExisteFeiraMock,
    } as unknown as FeiraService;
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
    } as unknown as ProdutoService;
    const carteiraService = {
      garantirCarteiraAceitaMeioPagamento:
        garantirCarteiraAceitaMeioPagamentoMock,
    } as unknown as CarteiraService;

    const taxaMeioPagamentoCarteiraService = {
      obterTaxaAtivaPorCarteiraEMeioPagamento:
        obterTaxaAtivaPorCarteiraEMeioPagamentoMock,
    } as unknown as TaxaMeioPagamentoCarteiraService;

    const precoProdutoFeiraService = {
      obterValorProdutoParaFeira: obterValorProdutoParaFeiraMock,
    } as unknown as PrecoProdutoFeiraService;

    const prepararItensVendaService = new PrepararItensVendaService(
      produtoService,
      precoProdutoFeiraService,
    );
    const prepararPagamentosVendaService = new PrepararPagamentosVendaService(
      carteiraService,
      taxaMeioPagamentoCarteiraService,
    );

    useCase = new AlterarVendaUseCase(
      vendaService,
      feiraService,
      prepararItensVendaService,
      prepararPagamentosVendaService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve alterar venda recriando itens e movimentos da própria venda', async () => {
    const vendaExistente = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      desconto: 0,
      itens: [
        {
          idProduto: 10,
          nomeProduto: 'Produto antigo',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
      pagamentos: [criarPagamentoInput(2000, MeioPagamento.DIN)],
    });
    vendaExistente.id = 5;

    const input: ExecutarAlterarVendaInput = {
      id: 5,
      dataVenda: '2026-04-02T12:00:00.000Z',
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      desconto: 200,
      itens: [{ idProduto: 20, quantidade: 1 }],
      pagamentos: [criarPagamentoInput(2300, MeioPagamento.PIX, 2)],
    };

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 2,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: true,
      percentualImpostoVenda: 4,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue({
      percentual: 3,
    });
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 20,
        nome: 'Produto novo',
        valor: 2500,
      }),
    );
    alterarVendaMock.mockResolvedValue(vendaExistente);

    const result = await useCase.execute(input);

    expect(garantirExisteVendaMock).toHaveBeenCalledWith(5);
    expect(garantirCarteiraAceitaMeioPagamentoMock).toHaveBeenCalledWith(
      2,
      MeioPagamento.PIX,
    );
    expect(garantirExisteFeiraMock).toHaveBeenCalledWith(3);
    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        tipo: TipoVenda.FEIRA,
        idFeira: 3,
        desconto: 200,
        valorTotal: 2300,
        pagamentos: [
          expect.objectContaining({
            idCarteira: 2,
            meioPagamento: MeioPagamento.PIX,
            valor: 2300,
            percentualTaxa: 3,
            valorTaxa: 69,
            percentualImposto: 4,
            valorImposto: 92,
          }),
        ],
      }),
      [
        expect.objectContaining({
          idProduto: 20,
          quantidade: 1,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          idUsuarioInclusao: 7,
        }),
      ],
    );
    expect(result).toBe(vendaExistente);
  });

  it('deve usar preço específico da feira ao alterar item de catálogo', async () => {
    const vendaExistente = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [],
      pagamentos: [criarPagamentoInput(0, MeioPagamento.DIN)],
    });
    vendaExistente.id = 8;
    const produto = Object.assign(new Produto(), {
      id: 20,
      nome: 'Produto novo',
      valor: 2500,
    });

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 2,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    garantirExisteProdutoMock.mockResolvedValue(produto);
    obterValorProdutoParaFeiraMock.mockResolvedValue(3200);
    alterarVendaMock.mockResolvedValue(vendaExistente);

    await useCase.execute({
      id: 8,
      dataVenda: '2026-04-02T12:00:00.000Z',
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      itens: [{ idProduto: 20, quantidade: 2 }],
      pagamentos: [criarPagamentoInput(6400, MeioPagamento.PIX, 2)],
    });

    expect(obterValorProdutoParaFeiraMock).toHaveBeenCalledWith(3, produto);
    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 8,
        valorTotal: 6400,
        itens: [
          expect.objectContaining({
            idProduto: 20,
            valorUnitario: 3200,
            valorTotal: 6400,
          }),
        ],
      }),
      expect.any(Array),
    );
  });

  it('deve alterar venda com item avulso sem movimentar estoque', async () => {
    const vendaExistente = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [],
      pagamentos: [criarPagamentoInput(0, MeioPagamento.DIN)],
    });
    vendaExistente.id = 6;

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    alterarVendaMock.mockResolvedValue(vendaExistente);

    await useCase.execute({
      id: 6,
      dataVenda: '2026-04-02T12:00:00.000Z',
      tipo: TipoVenda.LOJA,
      itens: [
        { nomeProduto: 'Peça avulsa', valorUnitario: 3000, quantidade: 1 },
      ],
      pagamentos: [criarPagamentoInput(3000)],
    });

    expect(garantirExisteProdutoMock).not.toHaveBeenCalled();
    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 6 }),
      [],
    );
  });

  it('deve lançar erro quando venda não existir', async () => {
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);

    garantirExisteVendaMock.mockRejectedValue(
      new NotFoundException('Venda com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        id: 99,
        dataVenda: '2026-04-02T12:00:00.000Z',
        tipo: TipoVenda.LOJA,
        itens: [{ idProduto: 1, quantidade: 1 }],
        pagamentos: [criarPagamentoInput(1000)],
      }),
    ).rejects.toThrow('Venda com ID 99 não encontrada.');
  });
  it('deve manter percentual de imposto nulo quando a carteira considerar imposto sem percentual definido', async () => {
    const vendaExistente = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [],
      pagamentos: [criarPagamentoInput(0, MeioPagamento.DIN)],
    });
    vendaExistente.id = 7;

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: true,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    alterarVendaMock.mockResolvedValue(vendaExistente);

    await useCase.execute({
      id: 7,
      dataVenda: '2026-04-02T12:00:00.000Z',
      tipo: TipoVenda.LOJA,
      itens: [
        { nomeProduto: 'Peça avulsa', valorUnitario: 3000, quantidade: 1 },
      ],
      pagamentos: [criarPagamentoInput(3000)],
    });

    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pagamentos: [
          expect.objectContaining({
            percentualImposto: null,
            valorImposto: null,
          }),
        ],
      }),
      [],
    );
  });
});
