import { NotFoundException } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { CategoriaProdutoService } from '@produto/services';
import {
  InserirCategoriaProdutoInput,
  InserirCategoriaProdutoUseCase,
} from '@produto/use-cases';

describe('InserirCategoriaProdutoUseCase', () => {
  let useCase: InserirCategoriaProdutoUseCase;
  let garantirExisteCategoriaMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let salvarCategoriaMock: jest.MockedFunction<
    (categoria: CategoriaProduto) => Promise<CategoriaProduto>
  >;

  beforeEach(() => {
    garantirExisteCategoriaMock = jest.fn<Promise<void>, [number]>();
    salvarCategoriaMock = jest.fn<
      Promise<CategoriaProduto>,
      [CategoriaProduto]
    >();

    const categoriaProdutoService = {
      garantirExisteCategoria: garantirExisteCategoriaMock,
      salvarCategoria: salvarCategoriaMock,
    } as unknown as CategoriaProdutoService;

    useCase = new InserirCategoriaProdutoUseCase(categoriaProdutoService);
  });

  it('deve inserir categoria sem categoria pai', async () => {
    const input: InserirCategoriaProdutoInput = {
      nome: 'Canecas',
    };
    const categoriaSalva = new CategoriaProduto();
    categoriaSalva.id = 1;
    categoriaSalva.nome = input.nome;

    salvarCategoriaMock.mockResolvedValue(categoriaSalva);

    const result = await useCase.execute(input);

    expect(garantirExisteCategoriaMock).not.toHaveBeenCalled();
    expect(salvarCategoriaMock).toHaveBeenCalledWith(
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

    garantirExisteCategoriaMock.mockResolvedValue(undefined);
    salvarCategoriaMock.mockResolvedValue(
      Object.assign(new CategoriaProduto(), {
        id: 6,
        nome: input.nome,
        idAscendente: input.idAscendente,
      }),
    );

    await useCase.execute(input);

    expect(garantirExisteCategoriaMock).toHaveBeenCalledWith(5);
    expect(salvarCategoriaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Canecas Termicas',
        idAscendente: 5,
      }),
    );
  });

  it('deve lançar erro quando a categoria pai não existe', async () => {
    garantirExisteCategoriaMock.mockRejectedValue(
      new NotFoundException('Categoria ascendente com ID 5 não encontrada.'),
    );

    await expect(
      useCase.execute({
        nome: 'Canecas Termicas',
        idAscendente: 5,
      }),
    ).rejects.toThrow(
      new NotFoundException('Categoria ascendente com ID 5 não encontrada.'),
    );

    expect(salvarCategoriaMock).not.toHaveBeenCalled();
  });
});
