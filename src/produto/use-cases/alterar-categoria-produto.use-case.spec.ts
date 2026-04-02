import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaProduto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { AlterarCategoriaProdutoUseCase } from './alterar-categoria-produto.use-case';

describe('AlterarCategoriaProdutoUseCase', () => {
  let useCase: AlterarCategoriaProdutoUseCase;
  let produtoService: {
    obterCategoriaPorId: jest.Mock;
    existeCategoria: jest.Mock;
    salvarCategoria: jest.Mock;
  };

  beforeEach(async () => {
    produtoService = {
      obterCategoriaPorId: jest.fn(),
      existeCategoria: jest.fn(),
      salvarCategoria: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlterarCategoriaProdutoUseCase,
        {
          provide: ProdutoService,
          useValue: produtoService,
        },
      ],
    }).compile();

    useCase = module.get<AlterarCategoriaProdutoUseCase>(
      AlterarCategoriaProdutoUseCase,
    );
  });

  it('deve alterar categoria quando categoria e ascendente existem', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 3,
      nome: 'FIDGET TOYS',
      idAscendente: undefined,
    });
    produtoService.obterCategoriaPorId.mockResolvedValue(categoria);
    produtoService.existeCategoria.mockResolvedValue(true);
    produtoService.salvarCategoria.mockImplementation(
      (value: CategoriaProduto) => Promise.resolve(value),
    );

    const result = await useCase.execute(3, {
      nome: 'FIDGET PREMIUM',
      idAscendente: 1,
    });

    expect(produtoService.obterCategoriaPorId).toHaveBeenCalledWith(3);
    expect(produtoService.existeCategoria).toHaveBeenCalledWith(1);
    expect(produtoService.salvarCategoria).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        nome: 'FIDGET PREMIUM',
        idAscendente: 1,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 3,
        nome: 'FIDGET PREMIUM',
        idAscendente: 1,
      }),
    );
  });

  it('deve lançar erro quando categoria não existe', async () => {
    produtoService.obterCategoriaPorId.mockResolvedValue(null);

    await expect(
      useCase.execute(99, { nome: 'FIDGET PREMIUM' }),
    ).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
  });

  it('deve lançar erro quando categoria ascendente não existe', async () => {
    produtoService.obterCategoriaPorId.mockResolvedValue(
      Object.assign(new CategoriaProduto(), { id: 3 }),
    );
    produtoService.existeCategoria.mockResolvedValue(false);

    await expect(
      useCase.execute(3, { nome: 'FIDGET PREMIUM', idAscendente: 5 }),
    ).rejects.toThrow(
      new NotFoundException('Categoria ascendente com ID 5 não encontrada.'),
    );
  });

  it('deve lançar erro quando categoria aponta para ela mesma', async () => {
    produtoService.obterCategoriaPorId.mockResolvedValue(
      Object.assign(new CategoriaProduto(), { id: 3 }),
    );

    await expect(
      useCase.execute(3, { nome: 'FIDGET PREMIUM', idAscendente: 3 }),
    ).rejects.toThrow(
      new BadRequestException(
        'A categoria não pode ser definida como ascendente dela mesma.',
      ),
    );
  });
});
