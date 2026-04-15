import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaProduto } from '@produto/entities';
import { CategoriaProdutoService } from '@produto/services';

describe('CategoriaProdutoService', () => {
  let service: CategoriaProdutoService;
  let categoriaRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let queryBuilder: {
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    where: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    categoriaRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaProdutoService,
        {
          provide: getRepositoryToken(CategoriaProduto),
          useValue: categoriaRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriaProdutoService>(CategoriaProdutoService);
  });

  it('deve salvar categoria com sucesso', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 1,
      nome: 'Canecas',
    });
    categoriaRepository.save.mockResolvedValue(categoria);

    const result = await service.salvarCategoria(categoria);

    expect(categoriaRepository.save).toHaveBeenCalledWith(categoria);
    expect(result).toBe(categoria);
  });

  it('deve lançar InternalServerErrorException ao falhar salvamento de categoria', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      nome: 'Canecas',
    });
    categoriaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvarCategoria(categoria)).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir categoria'),
    );
  });

  it('deve verificar existência de categoria', async () => {
    categoriaRepository.exists.mockResolvedValue(true);

    const result = await service.existeCategoria(1);

    expect(categoriaRepository.exists).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(true);
  });

  it('deve não lançar erro quando categoria existir em garantirExisteCategoria', async () => {
    categoriaRepository.exists.mockResolvedValue(true);

    await expect(service.garantirExisteCategoria(1)).resolves.not.toThrow();
  });

  it('deve lançar NotFoundException quando categoria não existir em garantirExisteCategoria', async () => {
    categoriaRepository.exists.mockResolvedValue(false);

    await expect(service.garantirExisteCategoria(99)).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
  });

  it('deve listar categorias sem filtro de termo', async () => {
    const categorias = [
      Object.assign(new CategoriaProduto(), { id: 1, nome: 'Canecas' }),
    ];
    queryBuilder.getManyAndCount.mockResolvedValue([categorias, 1]);

    const result = await service.listarCategorias({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(queryBuilder.where).not.toHaveBeenCalled();
    expect(result).toEqual({
      itens: categorias,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve listar categorias filtrando por termo', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.listarCategorias({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'Can',
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(categoria.nome) LIKE :termo',
      { termo: '%can%' },
    );
  });

  it('deve retornar totalPaginas mínimo 1 quando não há categorias', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.listarCategorias({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.totalPaginas).toBe(1);
  });

  it('deve obter categoria por id', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 1,
      nome: 'Canecas',
    });
    categoriaRepository.findOne.mockResolvedValue(categoria);

    const result = await service.obterCategoriaPorId(1);

    expect(categoriaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(categoria);
  });

  it('deve garantir categoria por id retornando a categoria', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 1,
      nome: 'Canecas',
    });
    categoriaRepository.findOne.mockResolvedValue(categoria);

    const result = await service.garantirCategoriaPorId(1);

    expect(result).toBe(categoria);
  });

  it('deve lançar NotFoundException quando categoria não existir em garantirCategoriaPorId', async () => {
    categoriaRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirCategoriaPorId(99)).rejects.toThrow(
      new NotFoundException('Categoria com ID 99 não encontrada.'),
    );
  });

  it('deve excluir categoria com sucesso', async () => {
    categoriaRepository.delete.mockResolvedValue(undefined);

    await service.excluirCategoria(1);

    expect(categoriaRepository.delete).toHaveBeenCalledWith({ id: 1 });
  });

  it('deve lançar erro interno ao falhar exclusão de categoria', async () => {
    categoriaRepository.delete.mockRejectedValue(new Error('falha'));

    await expect(service.excluirCategoria(1)).rejects.toThrow(
      new InternalServerErrorException('Erro ao excluir categoria'),
    );
  });
});
