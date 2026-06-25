import { NotFoundException } from '@nestjs/common';
import { Produto, StatusProduto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import {
  AlterarStatusProdutoInput,
  AlterarStatusProdutoUseCase,
} from '@produto/use-cases';

describe('AlterarStatusProdutoUseCase', () => {
  let useCase: AlterarStatusProdutoUseCase;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<Produto>
  >;
  let salvarMock: jest.MockedFunction<(produto: Produto) => Promise<Produto>>;

  beforeEach(() => {
    garantirExisteProdutoMock = jest.fn<Promise<Produto>, [number]>();
    salvarMock = jest.fn<Promise<Produto>, [Produto]>();

    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
      salvar: salvarMock,
    } as unknown as ProdutoService;

    useCase = new AlterarStatusProdutoUseCase(produtoService);
  });

  it('deve alterar o status do produto', async () => {
    const input: AlterarStatusProdutoInput = {
      id: 10,
      status: StatusProduto.INATIVO,
    };
    const produto = Object.assign(new Produto(), {
      id: 10,
      status: StatusProduto.ATIVO,
    });

    garantirExisteProdutoMock.mockResolvedValue(produto);
    salvarMock.mockResolvedValue(produto);

    const result = await useCase.execute(input);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(10);
    expect(salvarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        status: StatusProduto.INATIVO,
      }),
    );
    expect(result).toBe(produto);
  });

  it('deve lançar erro quando o produto não existe', async () => {
    garantirExisteProdutoMock.mockRejectedValue(
      new NotFoundException('Produto com ID 10 não encontrado'),
    );

    await expect(
      useCase.execute({ id: 10, status: StatusProduto.INATIVO }),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 10 não encontrado'),
    );

    expect(salvarMock).not.toHaveBeenCalled();
  });
});
