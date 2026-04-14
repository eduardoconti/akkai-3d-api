import { NotFoundException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { CarteiraService } from '@financeiro/services';
import {
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MovimentacaoEstoque } from '@produto/entities';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';
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
  let garantirCarteiraAceitaMeioPagamentoMock: jest.MockedFunction<
    (id: number, meio: MeioPagamento) => Promise<void>
  >;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<Produto>
  >;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    inserirVendaMock = jest.fn<
      Promise<Venda>,
      [Venda, MovimentacaoEstoque[]]
    >();
    garantirExisteFeiraMock = jest.fn<Promise<void>, [number]>();
    garantirCarteiraAceitaMeioPagamentoMock = jest.fn<
      Promise<void>,
      [number, MeioPagamento]
    >();
    garantirExisteProdutoMock = jest.fn<Promise<Produto>, [number]>();
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

    useCase = new InserirVendaUseCase(
      vendaService,
      feiraService,
      produtoService,
      carteiraService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve criar venda e movimentacoes de estoque corretamente', async () => {
    const input: ExecutarInserirVendaInput = {
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      desconto: 200,
      itens: [
        {
          idProduto: 1,
          quantidade: 2,
        },
      ],
    };
    const vendaPersistida = new Venda();
    vendaPersistida.id = 1;

    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 1,
        valor: 2500,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
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
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 1,
        idFeira: undefined,
        desconto: 200,
        valorTotal: 4800,
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

  it('deve usar desconto zero quando nao informado', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 1,
        valor: 1000,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
      itens: [{ idProduto: 1, quantidade: 1 }],
    });

    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idCarteira: 1,
        idFeira: undefined,
        desconto: 0,
        valorTotal: 1000,
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
        codigo: 'CN001',
        idCategoria: 1,
        valor: 1000,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
      idFeira: 3,
      itens: [{ idProduto: 1, quantidade: 1 }],
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
    garantirCarteiraAceitaMeioPagamentoMock.mockRejectedValue(
      new NotFoundException('Carteira com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.LOJA,
        idCarteira: 99,
        itens: [{ idProduto: 1, quantidade: 1 }],
      }),
    ).rejects.toThrow('Carteira com ID 99 não encontrada.');
  });

  it('deve lançar erro quando feira não existir', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    garantirExisteFeiraMock.mockRejectedValue(
      new NotFoundException('Feira com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.FEIRA,
        idCarteira: 1,
        idFeira: 99,
        itens: [{ idProduto: 1, quantidade: 1 }],
      }),
    ).rejects.toThrow('Feira com ID 99 não encontrada.');
  });

  it('deve lançar erro quando produto não existir', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    garantirExisteProdutoMock.mockRejectedValue(
      new NotFoundException('Produto com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.LOJA,
        idCarteira: 1,
        itens: [{ idProduto: 99, quantidade: 1 }],
      }),
    ).rejects.toThrow('Produto com ID 99 não encontrado.');
  });

  it('deve criar venda com item avulso sem movimentar estoque', async () => {
    inserirVendaMock.mockResolvedValue(new Venda());
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);

    await useCase.execute({
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
      itens: [
        {
          nomeProduto: 'Peca personalizada',
          valorUnitario: 4500,
          quantidade: 1,
        },
      ],
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
        codigo: 'CN001',
        idCategoria: 1,
        valor: 2500,
      }),
    );
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    inserirVendaMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute({
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [
        {
          idProduto: 1,
          quantidade: 2,
          brinde: true,
        },
      ],
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
});
