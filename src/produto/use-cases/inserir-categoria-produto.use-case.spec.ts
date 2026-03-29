import { NotFoundException } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import {
  InserirCategoriaProdutoInput,
  InserirCategoriaProdutoUseCase,
} from '@produto/use-cases';

describe('InserirCategoriaProdutoUseCase', () => {
  let useCase: InserirCategoriaProdutoUseCase;
  let existeCategoriaMock: jest.MockedFunction<
    (idCategoria: number) => Promise<boolean>
  >;
  let inserirCategoriaMock: jest.MockedFunction<
    (categoria: CategoriaProduto) => Promise<CategoriaProduto>
  >;

  beforeEach(() => {
    existeCategoriaMock = jest.fn<Promise<boolean>, [number]>();
    inserirCategoriaMock = jest.fn<
      Promise<CategoriaProduto>,
      [CategoriaProduto]
    >();

    const produtoService: Pick<
      ProdutoService,
      'existeCategoria' | 'inserirCategoria'
    > = {
      existeCategoria: existeCategoriaMock,
      inserirCategoria: inserirCategoriaMock,
    };

    useCase = new InserirCategoriaProdutoUseCase(
      produtoService as ProdutoService,
    );
  });

  it('deve inserir categoria sem categoria pai', async () => {
    const input: InserirCategoriaProdutoInput = {
      nome: 'Canecas',
    };
    const categoriaSalva = new CategoriaProduto();
    categoriaSalva.id = 1;
    categoriaSalva.nome = input.nome;

    inserirCategoriaMock.mockResolvedValue(categoriaSalva);

    const result = await useCase.execute(input);

    expect(existeCategoriaMock).not.toHaveBeenCalled();
    expect(inserirCategoriaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Canecas',
        idAscendente: undefined,
      }),
    );
    expect(result).toBe(categoriaSalva);
  });

  it('deve inserir categoria com categoria pai existente', async () => {
    const input: InserirCategoriaProdutoInput = {
      nome: 'Canecas Termicas',
      idAscendente: 5,
    };

    existeCategoriaMock.mockResolvedValue(true);
    inserirCategoriaMock.mockResolvedValue(
      Object.assign(new CategoriaProduto(), {
        id: 6,
        nome: input.nome,
        idAscendente: input.idAscendente,
      }),
    );

    await useCase.execute(input);

    expect(existeCategoriaMock).toHaveBeenCalledWith(5);
    expect(inserirCategoriaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Canecas Termicas',
        idAscendente: 5,
      }),
    );
  });

  it('deve lançar erro quando a categoria pai não existe', async () => {
    existeCategoriaMock.mockResolvedValue(false);

    await expect(
      useCase.execute({
        nome: 'Canecas Termicas',
        idAscendente: 5,
      }),
    ).rejects.toThrow(
      new NotFoundException('Categoria ascendente com ID 5 não encontrada.'),
    );

    expect(inserirCategoriaMock).not.toHaveBeenCalled();
  });
});
