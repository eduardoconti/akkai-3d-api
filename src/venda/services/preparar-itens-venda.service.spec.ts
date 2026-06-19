import {
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { TipoVenda } from '@venda/entities';
import {
  PrecoProdutoFeiraService,
  PrepararItensVendaService,
} from '@venda/services';

describe('PrepararItensVendaService', () => {
  let service: PrepararItensVendaService;
  let garantirExisteProdutoMock: jest.Mock;
  let obterValorProdutoParaFeiraMock: jest.Mock;

  beforeEach(() => {
    garantirExisteProdutoMock = jest.fn();
    obterValorProdutoParaFeiraMock = jest.fn(
      (_idFeira: number | undefined, produto: Produto) =>
        Promise.resolve(produto.valor),
    );

    service = new PrepararItensVendaService(
      {
        garantirExisteProduto: garantirExisteProdutoMock,
      } as unknown as ProdutoService,
      {
        obterValorProdutoParaFeira: obterValorProdutoParaFeiraMock,
      } as unknown as PrecoProdutoFeiraService,
    );
  });

  it('deve preparar item de catálogo com preço de feira e movimentação de estoque', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      nome: 'Caneca',
      valor: 1000,
    });
    garantirExisteProdutoMock.mockResolvedValue(produto);
    obterValorProdutoParaFeiraMock.mockResolvedValue(1500);

    const result = await service.preparar({
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      idUsuarioInclusao: 7,
      itens: [{ idProduto: 1, quantidade: 2 }],
    });

    expect(obterValorProdutoParaFeiraMock).toHaveBeenCalledWith(3, produto);
    expect(result).toEqual([
      expect.objectContaining({
        idProduto: 1,
        nomeProduto: 'Caneca',
        quantidade: 2,
        valorUnitario: 1500,
        brinde: undefined,
      }),
    ]);
    expect(result[0]!.movimentacaoEstoque).toEqual(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.VENDA,
        idUsuarioInclusao: 7,
      }),
    );
  });

  it('deve preparar item avulso sem consultar produto e sem movimentar estoque', async () => {
    const result = await service.preparar({
      tipo: TipoVenda.LOJA,
      idUsuarioInclusao: 7,
      itens: [
        {
          nomeProduto: 'Peça avulsa',
          quantidade: 1,
          valorUnitario: 3000,
        },
      ],
    });

    expect(garantirExisteProdutoMock).not.toHaveBeenCalled();
    expect(obterValorProdutoParaFeiraMock).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        nomeProduto: 'Peça avulsa',
        quantidade: 1,
        valorUnitario: 3000,
        brinde: undefined,
      },
    ]);
  });

  it('deve ignorar feira ao preparar item de venda que não é de feira', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      nome: 'Caneca',
      valor: 1000,
    });
    garantirExisteProdutoMock.mockResolvedValue(produto);

    await service.preparar({
      tipo: TipoVenda.LOJA,
      idFeira: 3,
      idUsuarioInclusao: 7,
      itens: [{ idProduto: 1, quantidade: 1 }],
    });

    expect(obterValorProdutoParaFeiraMock).toHaveBeenCalledWith(
      undefined,
      produto,
    );
  });
});
