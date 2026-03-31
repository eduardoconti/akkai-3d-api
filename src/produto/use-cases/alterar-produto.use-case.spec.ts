import { NotFoundException } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { AlterarProdutoInput, AlterarProdutoUseCase } from '@produto/use-cases';

describe('AlterarProdutoUseCase', () => {
  let useCase: AlterarProdutoUseCase;
  let obterProdutoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<Produto | null>
  >;
  let existeCategoriaMock: jest.MockedFunction<
    (idCategoria: number) => Promise<boolean>
  >;
  let salvarMock: jest.MockedFunction<(produto: Produto) => Promise<Produto>>;

  beforeEach(() => {
    obterProdutoPorIdMock = jest.fn<Promise<Produto | null>, [number]>();
    existeCategoriaMock = jest.fn<Promise<boolean>, [number]>();
    salvarMock = jest.fn<Promise<Produto>, [Produto]>();

    const produtoService: Pick<
      ProdutoService,
      'obterProdutoPorId' | 'existeCategoria' | 'salvar'
    > = {
      obterProdutoPorId: obterProdutoPorIdMock,
      existeCategoria: existeCategoriaMock,
      salvar: salvarMock,
    };

    useCase = new AlterarProdutoUseCase(produtoService as ProdutoService);
  });

  it('deve alterar produto quando a categoria existe', async () => {
    const input: AlterarProdutoInput = {
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

    obterProdutoPorIdMock.mockResolvedValue(produtoAtualizado);
    existeCategoriaMock.mockResolvedValue(true);
    salvarMock.mockResolvedValue(produtoAtualizado);

    const result = await useCase.execute(10, input);

    expect(obterProdutoPorIdMock).toHaveBeenCalledWith(10);
    expect(existeCategoriaMock).toHaveBeenCalledWith(2);
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
    obterProdutoPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute(10, {
        nome: 'Caneca Nova',
        codigo: 'CN002',
        idCategoria: 2,
        valor: 3190,
      }),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 10 não encontrado'),
    );

    expect(existeCategoriaMock).not.toHaveBeenCalled();
    expect(salvarMock).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando a categoria não existe', async () => {
    obterProdutoPorIdMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 10 }),
    );
    existeCategoriaMock.mockResolvedValue(false);

    await expect(
      useCase.execute(10, {
        nome: 'Caneca Nova',
        codigo: 'CN002',
        idCategoria: 99,
        valor: 3190,
      }),
    ).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
    expect(salvarMock).not.toHaveBeenCalled();
  });
});
