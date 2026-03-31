import {
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MovimentacaoEstoque } from '@produto/entities';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import {
  ExecutarInserirVendaInput,
  InserirVendaUseCase,
} from '@venda/use-cases';

describe('InserirVendaUseCase', () => {
  let useCase: InserirVendaUseCase;
  let inserirVendaMock: jest.MockedFunction<
    (venda: Venda, movimentacoes: MovimentacaoEstoque[]) => Promise<Venda>
  >;
  let existeFeiraMock: jest.MockedFunction<
    (idFeira: number) => Promise<boolean>
  >;
  let obterProdutoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<Produto | null>
  >;

  beforeEach(() => {
    inserirVendaMock = jest.fn<
      Promise<Venda>,
      [Venda, MovimentacaoEstoque[]]
    >();
    existeFeiraMock = jest.fn<Promise<boolean>, [number]>();
    obterProdutoPorIdMock = jest.fn<Promise<Produto | null>, [number]>();

    const vendaService: Pick<VendaService, 'inserirVenda' | 'existeFeira'> = {
      inserirVenda: inserirVendaMock,
      existeFeira: existeFeiraMock,
    };
    const produtoService: Pick<ProdutoService, 'obterProdutoPorId'> = {
      obterProdutoPorId: obterProdutoPorIdMock,
    };

    useCase = new InserirVendaUseCase(
      vendaService as VendaService,
      produtoService as ProdutoService,
    );
  });

  it('deve criar venda e movimentacoes de estoque corretamente', async () => {
    const input: ExecutarInserirVendaInput = {
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.LOJA,
      desconto: 200,
      itens: [
        {
          idProduto: 1,
          quantidade: 2,
          desconto: 100,
        },
      ],
    };
    const vendaPersistida = new Venda();
    vendaPersistida.id = 1;

    obterProdutoPorIdMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 1,
        valor: 2500,
      }),
    );
    existeFeiraMock.mockResolvedValue(true);
    inserirVendaMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute(input);

    expect(obterProdutoPorIdMock).toHaveBeenCalledWith(1);
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoVenda.LOJA,
        meioPagamento: MeioPagamento.PIX,
        idFeira: undefined,
        desconto: 300,
        valorTotal: 4700,
        itens: [
          expect.objectContaining({
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 2,
            valorUnitario: 2500,
            desconto: 100,
            valorTotal: 4900,
          }),
        ],
      }),
      [
        expect.objectContaining({
          idProduto: 1,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
        }),
      ],
    );
    expect(result).toBe(vendaPersistida);
  });

  it('deve usar desconto zero quando nao informado', async () => {
    obterProdutoPorIdMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 1,
        valor: 1000,
      }),
    );
    existeFeiraMock.mockResolvedValue(true);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      itens: [{ idProduto: 1, quantidade: 1 }],
    });

    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idFeira: undefined,
        desconto: 0,
        valorTotal: 1000,
        itens: [
          expect.objectContaining({
            idProduto: 1,
            nomeProduto: 'Caneca',
            desconto: 0,
            valorTotal: 1000,
          }),
        ],
      }),
      expect.any(Array),
    );
  });

  it('deve validar a existência da feira quando idFeira for informado', async () => {
    obterProdutoPorIdMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 1,
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 1,
        valor: 1000,
      }),
    );
    existeFeiraMock.mockResolvedValue(true);
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      itens: [{ idProduto: 1, quantidade: 1 }],
    });

    expect(existeFeiraMock).toHaveBeenCalledWith(3);
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idFeira: 3,
      }),
      expect.any(Array),
    );
  });

  it('deve criar venda com item avulso sem movimentar estoque', async () => {
    inserirVendaMock.mockResolvedValue(new Venda());

    await useCase.execute({
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.FEIRA,
      itens: [
        {
          nomeProduto: 'Peca personalizada',
          valorUnitario: 4500,
          quantidade: 1,
          desconto: 500,
        },
      ],
    });

    expect(obterProdutoPorIdMock).not.toHaveBeenCalled();
    expect(inserirVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        valorTotal: 4000,
        itens: [
          expect.objectContaining({
            idProduto: undefined,
            nomeProduto: 'Peca personalizada',
            valorUnitario: 4500,
            quantidade: 1,
            desconto: 500,
            valorTotal: 4000,
          }),
        ],
      }),
      [],
    );
  });
});
