import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('ProdutoService', () => {
  let service: ProdutoService;

  let produtoRepository: {
    find: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let categoriaRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    find: jest.Mock;
  };
  let movimentacaoEstoqueRepository: {
    save: jest.Mock;
  };
  let dataSource: {
    query: jest.Mock;
  };

  beforeEach(async () => {
    produtoRepository = {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    categoriaRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      find: jest.fn(),
    };
    movimentacaoEstoqueRepository = {
      save: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        {
          provide: getRepositoryToken(Produto),
          useValue: produtoRepository,
        },
        {
          provide: getRepositoryToken(CategoriaProduto),
          useValue: categoriaRepository,
        },
        {
          provide: getRepositoryToken(MovimentacaoEstoque),
          useValue: movimentacaoEstoqueRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve listar produtos com categoria', async () => {
    const produtos = [Object.assign(new Produto(), { id: 1 })];
    produtoRepository.find.mockResolvedValue(produtos);

    const result = await service.listarProdutos();

    expect(produtoRepository.find).toHaveBeenCalledWith({
      relations: { categoria: true },
    });
    expect(result).toBe(produtos);
  });

  it('deve inserir produto com sucesso', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      codigo: 'CAN001',
    });
    produtoRepository.save.mockResolvedValue(produto);

    const result = await service.inserirProduto(produto);

    expect(produtoRepository.save).toHaveBeenCalledWith(produto);
    expect(result).toBe(produto);
  });

  it('deve lançar conflito ao inserir produto com código duplicado', async () => {
    const produto = Object.assign(new Produto(), { codigo: 'CAN001' });
    produtoRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.inserirProduto(produto)).rejects.toThrow(
      new ConflictException('Código CAN001 já existe'),
    );
  });

  it('deve lançar erro interno ao falhar inserção de produto', async () => {
    const produto = Object.assign(new Produto(), { codigo: 'CAN001' });
    produtoRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirProduto(produto)).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir produto'),
    );
  });

  it('deve inserir categoria com sucesso', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 1,
      nome: 'Canecas',
    });
    categoriaRepository.save.mockResolvedValue(categoria);

    const result = await service.inserirCategoria(categoria);

    expect(categoriaRepository.save).toHaveBeenCalledWith(categoria);
    expect(result).toBe(categoria);
  });

  it('deve lançar erro interno ao falhar inserção de categoria', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      nome: 'Canecas',
    });
    categoriaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirCategoria(categoria)).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir categoria'),
    );
  });

  it('deve verificar existência de categoria', async () => {
    categoriaRepository.exists.mockResolvedValue(true);

    const result = await service.existeCategoria(5);

    expect(categoriaRepository.exists).toHaveBeenCalledWith({
      where: { id: 5 },
    });
    expect(result).toBe(true);
  });

  it('deve listar categorias', async () => {
    const categorias = [Object.assign(new CategoriaProduto(), { id: 1 })];
    categoriaRepository.find.mockResolvedValue(categorias);

    const result = await service.listarCategorias();

    expect(categoriaRepository.find).toHaveBeenCalled();
    expect(result).toBe(categorias);
  });

  it('deve retornar detalhe do produto com estoque calculado', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      nome: 'Caneca',
      codigo: 'CAN001',
      valor: 2500,
      categoria: { id: 2, nome: 'Canecas' },
    });
    produtoRepository.findOne.mockResolvedValue(produto);
    dataSource.query.mockResolvedValue([{ total: 7 }]);

    const result = await service.getProdutoById(1);

    expect(produtoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { categoria: true },
    });
    expect(dataSource.query).toHaveBeenCalled();
    expect(result).toEqual({
      ...produto,
      quantidadeEstoque: 7,
    });
  });

  it('deve lançar erro ao buscar produto inexistente', async () => {
    produtoRepository.findOne.mockResolvedValue(null);

    await expect(service.getProdutoById(99)).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
  });

  it('deve registrar entrada de estoque', async () => {
    produtoRepository.findOne.mockResolvedValue(
      Object.assign(new Produto(), { id: 1 }),
    );
    movimentacaoEstoqueRepository.save.mockResolvedValue(undefined);

    await service.entradaEstoque(1, 10, OrigemMovimentacaoEstoque.COMPRA);

    expect(movimentacaoEstoqueRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 10,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.COMPRA,
      }),
    );
  });

  it('deve lançar erro ao registrar entrada em produto inexistente', async () => {
    produtoRepository.findOne.mockResolvedValue(null);

    await expect(
      service.entradaEstoque(99, 10, OrigemMovimentacaoEstoque.COMPRA),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
  });
});
