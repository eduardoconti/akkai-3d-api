import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriaProduto } from '@produto/entities';
import { CategoriaProdutoService } from '@produto/services';
import { AlterarCategoriaProdutoUseCase } from './alterar-categoria-produto.use-case';

describe('AlterarCategoriaProdutoUseCase', () => {
  let useCase: AlterarCategoriaProdutoUseCase;
  let categoriaProdutoService: {
    garantirCategoriaPorId: jest.Mock;
    garantirExisteCategoria: jest.Mock;
    salvarCategoria: jest.Mock;
  };

  beforeEach(() => {
    categoriaProdutoService = {
      garantirCategoriaPorId: jest.fn(),
      garantirExisteCategoria: jest.fn(),
      salvarCategoria: jest.fn(),
    };

    useCase = new AlterarCategoriaProdutoUseCase(
      categoriaProdutoService as unknown as CategoriaProdutoService,
    );
  });

  it('deve alterar categoria quando categoria e ascendente existem', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 3,
      nome: 'FIDGET TOYS',
      idAscendente: undefined,
    });
    categoriaProdutoService.garantirCategoriaPorId.mockResolvedValue(categoria);
    categoriaProdutoService.garantirExisteCategoria.mockResolvedValue(
      undefined,
    );
    categoriaProdutoService.salvarCategoria.mockImplementation(
      (value: CategoriaProduto) => Promise.resolve(value),
    );

    const result = await useCase.execute({ id: 3, nome: 'FIDGET PREMIUM', idAscendente: 1 });

    expect(categoriaProdutoService.garantirCategoriaPorId).toHaveBeenCalledWith(
      3,
    );
    expect(
      categoriaProdutoService.garantirExisteCategoria,
    ).toHaveBeenCalledWith(1);
    expect(categoriaProdutoService.salvarCategoria).toHaveBeenCalledWith(
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
    categoriaProdutoService.garantirCategoriaPorId.mockRejectedValue(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({ id: 99, nome: 'FIDGET PREMIUM' }),
    ).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
  });

  it('deve lançar erro quando categoria ascendente não existe', async () => {
    categoriaProdutoService.garantirCategoriaPorId.mockResolvedValue(
      Object.assign(new CategoriaProduto(), { id: 3 }),
    );
    categoriaProdutoService.garantirExisteCategoria.mockRejectedValue(
      new NotFoundException('Categoria com ID 5 não encontrada.'),
    );

    await expect(
      useCase.execute({ id: 3, nome: 'FIDGET PREMIUM', idAscendente: 5 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro quando categoria aponta para ela mesma', async () => {
    categoriaProdutoService.garantirCategoriaPorId.mockResolvedValue(
      Object.assign(new CategoriaProduto(), { id: 3 }),
    );

    await expect(
      useCase.execute({ id: 3, nome: 'FIDGET PREMIUM', idAscendente: 3 }),
    ).rejects.toThrow(
      new BadRequestException(
        'A categoria não pode ser definida como ascendente dela mesma.',
      ),
    );
  });
});
