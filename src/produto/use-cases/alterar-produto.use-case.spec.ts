import { NotFoundException } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';
import { AlterarProdutoInput, AlterarProdutoUseCase } from '@produto/use-cases';

describe('AlterarProdutoUseCase', () => {
  let useCase: AlterarProdutoUseCase;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<Produto>
  >;
  let garantirExisteCategoriaMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let salvarMock: jest.MockedFunction<(produto: Produto) => Promise<Produto>>;

  beforeEach(() => {
    garantirExisteProdutoMock = jest.fn<Promise<Produto>, [number]>();
    garantirExisteCategoriaMock = jest.fn<Promise<void>, [number]>();
    salvarMock = jest.fn<Promise<Produto>, [Produto]>();

    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
      salvar: salvarMock,
    } as unknown as ProdutoService;

    const categoriaProdutoService = {
      garantirExisteCategoria: garantirExisteCategoriaMock,
    } as unknown as CategoriaProdutoService;

    useCase = new AlterarProdutoUseCase(
      produtoService,
      categoriaProdutoService,
    );
  });

  it('deve alterar produto quando a categoria existe', async () => {
    const input: AlterarProdutoInput = {
      id: 10,
      nome: 'Caneca Nova',
      codigo: 'CN002',
      descricao: 'Caneca de ceramica atualizada',
      estoqueMinimo: 5,
      idCategoria: 2,
      valor: 3190,
    };
    const produtoAtualizado = new Produto();
    produtoAtualizado.id = 10;
    produtoAtualizado.nome = input.nome;
    produtoAtualizado.codigo = input.codigo;
    produtoAtualizado.descricao = input.descricao;
    produtoAtualizado.estoqueMinimo = input.estoqueMinimo;
    produtoAtualizado.idCategoria = input.idCategoria;
    produtoAtualizado.valor = input.valor;

    garantirExisteProdutoMock.mockResolvedValue(produtoAtualizado);
    garantirExisteCategoriaMock.mockResolvedValue(undefined);
    salvarMock.mockResolvedValue(produtoAtualizado);

    const result = await useCase.execute(input);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(10);
    expect(garantirExisteCategoriaMock).toHaveBeenCalledWith(2);
    expect(salvarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        nome: 'Caneca Nova',
        codigo: 'CN002',
        descricao: 'Caneca de ceramica atualizada',
        estoqueMinimo: 5,
        idCategoria: 2,
        valor: 3190,
      }),
    );
    expect(result).toBe(produtoAtualizado);
  });

  it('deve lançar erro quando o produto não existe', async () => {
    garantirExisteProdutoMock.mockRejectedValue(
      new NotFoundException('Produto com ID 10 não encontrado'),
    );

    await expect(
      useCase.execute({ id: 10, nome: 'Caneca Nova', codigo: 'CN002', idCategoria: 2, valor: 3190 }),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 10 não encontrado'),
    );

    expect(garantirExisteCategoriaMock).not.toHaveBeenCalled();
    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando a categoria não existe', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 10 }),
    );
    garantirExisteCategoriaMock.mockRejectedValue(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({ id: 10, nome: 'Caneca Nova', codigo: 'CN002', idCategoria: 99, valor: 3190 }),
    ).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
    expect(salvarMock).not.toHaveBeenCalled();
  });
});
