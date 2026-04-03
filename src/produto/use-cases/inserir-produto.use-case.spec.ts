import { NotFoundException } from '@nestjs/common';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';
import { InserirProdutoInput, InserirProdutoUseCase } from '@produto/use-cases';

describe('InserirProdutoUseCase', () => {
  let useCase: InserirProdutoUseCase;
  let garantirExisteCategoriaMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let salvarMock: jest.MockedFunction<(produto: Produto) => Promise<Produto>>;

  beforeEach(() => {
    garantirExisteCategoriaMock = jest.fn<Promise<void>, [number]>();
    salvarMock = jest.fn<Promise<Produto>, [Produto]>();

    const produtoService = {
      salvar: salvarMock,
    } as unknown as ProdutoService;

    const categoriaProdutoService = {
      garantirExisteCategoria: garantirExisteCategoriaMock,
    } as unknown as CategoriaProdutoService;

    useCase = new InserirProdutoUseCase(
      produtoService,
      categoriaProdutoService,
    );
  });

  it('deve inserir produto quando a categoria existe', async () => {
    const input: InserirProdutoInput = {
      nome: 'Caneca',
      codigo: 'CN001',
      descricao: 'Caneca de ceramica',
      idCategoria: 1,
      valor: 2590,
    };
    const produtoSalvo = new Produto();
    produtoSalvo.id = 10;
    produtoSalvo.nome = input.nome;
    produtoSalvo.codigo = input.codigo;
    produtoSalvo.descricao = input.descricao;
    produtoSalvo.idCategoria = input.idCategoria;
    produtoSalvo.valor = input.valor;

    garantirExisteCategoriaMock.mockResolvedValue(undefined);
    salvarMock.mockResolvedValue(produtoSalvo);

    const result = await useCase.execute(input);

    expect(garantirExisteCategoriaMock).toHaveBeenCalledWith(1);
    expect(salvarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Caneca',
        codigo: 'CN001',
        descricao: 'Caneca de ceramica',
        idCategoria: 1,
        valor: 2590,
      }),
    );
    expect(result).toBe(produtoSalvo);
  });

  it('deve lançar erro quando a categoria não existe', async () => {
    garantirExisteCategoriaMock.mockRejectedValue(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        nome: 'Caneca',
        codigo: 'CN001',
        idCategoria: 99,
        valor: 2590,
      }),
    ).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );

    expect(salvarMock).not.toHaveBeenCalled();
  });
});
