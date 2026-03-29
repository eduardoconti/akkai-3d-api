import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { DetalheProdutoDto } from '@produto/dto';
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
  let getProdutoByIdMock: jest.MockedFunction<
    (id: number) => Promise<DetalheProdutoDto>
  >;

  beforeEach(() => {
    inserirVendaMock = jest.fn<
      Promise<Venda>,
      [Venda, MovimentacaoEstoque[]]
    >();
    existeFeiraMock = jest.fn<Promise<boolean>, [number]>();
    getProdutoByIdMock = jest.fn<Promise<DetalheProdutoDto>, [number]>();

    const vendaService: Pick<VendaService, 'inserirVenda' | 'existeFeira'> = {
      inserirVenda: inserirVendaMock,
      existeFeira: existeFeiraMock,
    };
    const produtoService: Pick<ProdutoService, 'getProdutoById'> = {
      getProdutoById: getProdutoByIdMock,
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

    getProdutoByIdMock.mockResolvedValue({
      id: 1,
      nome: 'Caneca',
      codigo: 'CN001',
      categoria: {
        id: 1,
        nome: 'Canecas',
      },
      valor: 2500,
      quantidadeEstoque: 10,
    });
    existeFeiraMock.mockResolvedValue(true);
    inserirVendaMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute(input);

    expect(getProdutoByIdMock).toHaveBeenCalledWith(1);
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
    getProdutoByIdMock.mockResolvedValue({
      id: 1,
      nome: 'Caneca',
      codigo: 'CN001',
      categoria: {
        id: 1,
        nome: 'Canecas',
      },
      valor: 1000,
      quantidadeEstoque: 10,
    });
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
        itens: [expect.objectContaining({ desconto: 0, valorTotal: 1000 })],
      }),
      expect.any(Array),
    );
  });

  it('deve validar a existência da feira quando idFeira for informado', async () => {
    getProdutoByIdMock.mockResolvedValue({
      id: 1,
      nome: 'Caneca',
      codigo: 'CN001',
      categoria: {
        id: 1,
        nome: 'Canecas',
      },
      valor: 1000,
      quantidadeEstoque: 10,
    });
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
});
