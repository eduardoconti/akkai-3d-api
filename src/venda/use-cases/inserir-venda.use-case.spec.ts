import { NotFoundException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import {
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MovimentacaoEstoque } from '@produto/entities';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import {
  ExecutarInserirVendaInput,
  InserirVendaUseCase,
} from '@venda/use-cases';

describe('InserirVendaUseCase', () => {
  let useCase: InserirVendaUseCase;
  let inserirVendaMock: jest.MockedFunction<
    (venda: Venda, movimentacoes: MovimentacaoEstoque[]) => Promise<Venda>
  >;
  let garantirExisteFeiraMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let garantirCarteiraAceitaMeioPagamentoMock: jest.Mock;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<Produto>
  >;
  let obterTaxaAtivaPorCarteiraEMeioPagamentoMock: jest.Mock;
  let obterValorProdutoParaFeiraMock: jest.MockedFunction<
    (idFeira: number | undefined, produto: Produto) => Promise<number>
  >;
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
    inserirVendaMock = jest.fn<
      Promise<Venda>,
      [Venda, MovimentacaoEstoque[]]
    >();
    garantirExisteFeiraMock = jest.fn<Promise<void>, [number]>();
    garantirCarteiraAceitaMeioPagamentoMock = jest.fn();
    garantirExisteProdutoMock = jest.fn<Promise<Produto>, [number]>();
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock = jest.fn();
    obterValorProdutoParaFeiraMock = jest.fn(
      (_idFeira: number | undefined, produto: Produto) =>
        Promise.resolve(produto.valor),
    );
    currentUserContext = { usuarioId: 7 };

    const vendaService = {
      inserirVenda: inserirVendaMock,
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

    useCase = new InserirVendaUseCase(
      vendaService,
      feiraService,
      produtoService,
      carteiraService,
      taxaMeioPagamentoCarteiraService,
      precoProdutoFeiraService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve criar venda e movimentacoes de estoque corretamente', async () => {
    const input: ExecutarInserirVendaInput = {
      tipo: TipoVenda.LOJA,
      desconto: 200,
      itens: [
        {
          idProduto: 1,
          quantidade: 2,
        },
      ],
      pagamentos: [criarPagamentoInput(4800)],
    };
    const vendaPersistida = new Venda();
    vendaPersistida.id = 1;

    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 1001,
        idCategoria: 1,
        valor: 2500,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: true,
      percentualImpostoVenda: 4,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue({
      percentual: 2.5,
    });
    inserirVendaMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute(input);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(garantirCarteiraAceitaMeioPagamentoMock).toHaveBeenCalledWith(
      1,
      MeioPagamento.PIX,
    );
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoVenda.LOJA,
        idFeira: undefined,
        desconto: 200,
        valorTotal: 4800,
        pagamentos: [
          expect.objectContaining({
            idCarteira: 1,
            meioPagamento: MeioPagamento.PIX,
            valor: 4800,
            percentualTaxa: 2.5,
            valorTaxa: 120,
            percentualImposto: 4,
            valorImposto: 192,
          }),
        ],
        itens: [
          expect.objectContaining({
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 2,
            valorUnitario: 2500,
            valorTotal: 5000,
          }),
        ],
      }),
      [
        expect.objectContaining({
          idProduto: 1,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          idUsuarioInclusao: 7,
        }),
      ],
    );
    expect(result).toBe(vendaPersistida);
  });

  it('deve usar preço específico da feira para item de catálogo', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      nome: 'Caneca',
      codigo: 1001,
      idCategoria: 1,
      valor: 1000,
    });

    garantirExisteProdutoMock.mockResolvedValue(produto);
    obterValorProdutoParaFeiraMock.mockResolvedValue(1500);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.DIN],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      itens: [{ idProduto: 1, quantidade: 2 }],
      pagamentos: [criarPagamentoInput(3000, MeioPagamento.DIN)],
    });

    expect(obterValorProdutoParaFeiraMock).toHaveBeenCalledWith(3, produto);
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        valorTotal: 3000,
        itens: [
          expect.objectContaining({
            idProduto: 1,
            valorUnitario: 1500,
            valorTotal: 3000,
          }),
        ],
      }),
      expect.any(Array),
    );
  });

  it('deve usar desconto zero quando nao informado', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 1001,
        idCategoria: 1,
        valor: 1000,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.DIN],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      tipo: TipoVenda.FEIRA,
      itens: [{ idProduto: 1, quantidade: 1 }],
      pagamentos: [criarPagamentoInput(1000, MeioPagamento.DIN)],
    });

    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idFeira: undefined,
        desconto: 0,
        valorTotal: 1000,
        pagamentos: [
          expect.objectContaining({
            idCarteira: 1,
            meioPagamento: MeioPagamento.DIN,
            valor: 1000,
            percentualTaxa: null,
            valorTaxa: null,
            percentualImposto: null,
            valorImposto: null,
          }),
        ],
        itens: [
          expect.objectContaining({
            idProduto: 1,
            nomeProduto: 'Caneca',
            valorTotal: 1000,
          }),
        ],
      }),
      expect.any(Array),
    );
  });

  it('deve validar a existência da feira quando idFeira for informado', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 1001,
        idCategoria: 1,
        valor: 1000,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.DIN],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      itens: [{ idProduto: 1, quantidade: 1 }],
      pagamentos: [criarPagamentoInput(1000, MeioPagamento.DIN)],
    });

    expect(garantirExisteFeiraMock).toHaveBeenCalledWith(3);
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idFeira: 3,
      }),
      expect.any(Array),
    );
  });

  it('deve lançar erro quando carteira não existir', async () => {
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);

    garantirCarteiraAceitaMeioPagamentoMock.mockRejectedValue(
      new NotFoundException('Carteira com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        tipo: TipoVenda.LOJA,
        itens: [{ idProduto: 1, quantidade: 1 }],
        pagamentos: [criarPagamentoInput(1000, MeioPagamento.PIX, 99)],
      }),
    ).rejects.toThrow('Carteira com ID 99 não encontrada.');
  });

  it('deve lançar erro quando feira não existir', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    garantirExisteFeiraMock.mockRejectedValue(
      new NotFoundException('Feira com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        tipo: TipoVenda.FEIRA,
        idFeira: 99,
        itens: [{ idProduto: 1, quantidade: 1 }],
        pagamentos: [criarPagamentoInput(1000)],
      }),
    ).rejects.toThrow('Feira com ID 99 não encontrada.');
  });

  it('deve lançar erro quando produto não existir', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    garantirExisteProdutoMock.mockRejectedValue(
      new NotFoundException('Produto com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({
        tipo: TipoVenda.LOJA,
        itens: [{ idProduto: 99, quantidade: 1 }],
        pagamentos: [criarPagamentoInput(1000)],
      }),
    ).rejects.toThrow('Produto com ID 99 não encontrado.');
  });

  it('deve criar venda com item avulso sem movimentar estoque', async () => {
    inserirVendaMock.mockResolvedValue(new Venda());
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);

    await useCase.execute({
      tipo: TipoVenda.FEIRA,
      itens: [
        {
          nomeProduto: 'Peca personalizada',
          valorUnitario: 4500,
          quantidade: 1,
        },
      ],
      pagamentos: [criarPagamentoInput(4500)],
    });

    expect(garantirExisteProdutoMock).not.toHaveBeenCalled();
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        valorTotal: 4500,
        itens: [
          expect.objectContaining({
            idProduto: undefined,
            nomeProduto: 'Peca personalizada',
            valorUnitario: 4500,
            quantidade: 1,
            valorTotal: 4500,
          }),
        ],
      }),
      [],
    );
  });

  it('deve registrar item de catálogo como brinde com valor zero e manter saída de estoque', async () => {
    const vendaPersistida = new Venda();
    vendaPersistida.id = 2;

    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 1001,
        idCategoria: 1,
        valor: 2500,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: false,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    inserirVendaMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute({
      tipo: TipoVenda.LOJA,
      itens: [
        {
          idProduto: 1,
          quantidade: 2,
          brinde: true,
        },
      ],
      pagamentos: [criarPagamentoInput(0)],
    });

    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        valorTotal: 0,
        itens: [
          expect.objectContaining({
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 2,
            brinde: true,
            valorUnitario: 0,
            valorTotal: 0,
          }),
        ],
      }),
      [
        expect.objectContaining({
          idProduto: 1,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          idUsuarioInclusao: 7,
        }),
      ],
    );
    expect(result).toBe(vendaPersistida);
  });
  it('deve manter percentual de imposto nulo quando a carteira considerar imposto sem percentual definido', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 1001,
        idCategoria: 1,
        valor: 1000,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      id: 1,
      ativa: true,
      meiosPagamento: [MeioPagamento.PIX],
      consideraImpostoVenda: true,
      percentualImpostoVenda: null,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      tipo: TipoVenda.LOJA,
      itens: [{ idProduto: 1, quantidade: 1 }],
      pagamentos: [criarPagamentoInput(1000)],
    });

    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pagamentos: [
          expect.objectContaining({
            percentualImposto: null,
            valorImposto: null,
          }),
        ],
      }),
      expect.any(Array),
    );
  });
});
