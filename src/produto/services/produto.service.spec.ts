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
import { ListarProdutoDto } from '@produto/dto';

describe('ProdutoService', () => {
  let service: ProdutoService;

  let produtoRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    exists: jest.Mock;
  };
  let categoriaRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let movimentacaoEstoqueRepository: {
    save: jest.Mock;
  };
  let dataSource: {
    query: jest.Mock;
  };

  beforeEach(async () => {
    produtoRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
    };
    categoriaRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
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

  it('deve listar produtos com estoque calculado', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: '1' }])
      .mockResolvedValueOnce([
        {
          id: '1',
          nome: 'Caneca',
          codigo: 'CAN001',
          descricao: 'Modelo geek',
          id_categoria: '2',
          estoque_minimo: '3',
          valor: '2500',
          categoria_id: '2',
          categoria_nome: 'Canecas',
          quantidade_estoque: '9',
        },
      ]);

    const result = await service.listarProdutos({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(dataSource.query).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      itens: [
        {
          id: 1,
          nome: 'Caneca',
          codigo: 'CAN001',
          descricao: 'Modelo geek',
          idCategoria: 2,
          estoqueMinimo: 3,
          valor: 2500,
          categoria: { id: 2, nome: 'Canecas' },
          quantidadeEstoque: 9,
        },
      ] satisfies ListarProdutoDto[],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve ordenar produtos por código quando solicitado', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: '0' }])
      .mockResolvedValueOnce([]);

    await service.listarProdutos({
      pagina: 1,
      tamanhoPagina: 10,
      ordenarPor: 'codigo',
      direcao: 'desc',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('ORDER BY p.codigo DESC'),
      expect.any(Array),
    );
  });

  it('deve salvar produto com sucesso', async () => {
    const produto = Object.assign(new Produto(), {
      id: 1,
      codigo: 'CAN001',
    });
    produtoRepository.save.mockResolvedValue(produto);

    const result = await service.salvar(produto);

    expect(produtoRepository.save).toHaveBeenCalledWith(produto);
    expect(result).toBe(produto);
  });

  it('deve buscar produto por id', async () => {
    const produto = Object.assign(new Produto(), { id: 1 });
    produtoRepository.findOne.mockResolvedValue(produto);

    const result = await service.obterProdutoPorId(1);

    expect(produtoRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toBe(produto);
  });

  it('deve lançar conflito ao inserir produto com código duplicado', async () => {
    const produto = Object.assign(new Produto(), { codigo: 'CAN001' });
    produtoRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvar(produto)).rejects.toThrow(
      new ConflictException('Código CAN001 já existe'),
    );
  });

  it('deve lançar erro interno ao falhar salvamento de produto', async () => {
    const produto = Object.assign(new Produto(), { codigo: 'CAN001' });
    produtoRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvar(produto)).rejects.toThrow(
      new InternalServerErrorException('Erro ao salvar produto'),
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

  it('deve verificar existência de produto', async () => {
    produtoRepository.exists.mockResolvedValue(true);

    const result = await service.existeProduto(7);

    expect(produtoRepository.exists).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(result).toBe(true);
  });

  it('deve listar categorias', async () => {
    const categorias = [Object.assign(new CategoriaProduto(), { id: 1 })];
    const queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([categorias, 1]),
    };
    categoriaRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.listarCategorias({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(categoriaRepository.createQueryBuilder).toHaveBeenCalledWith(
      'categoria',
    );
    expect(result).toEqual({
      itens: categorias,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve buscar categoria por id', async () => {
    const categoria = Object.assign(new CategoriaProduto(), { id: 2 });
    categoriaRepository.findOne.mockResolvedValue(categoria);

    const result = await service.obterCategoriaPorId(2);

    expect(categoriaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 2 },
    });
    expect(result).toBe(categoria);
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

    const result = await service.obterDetalheProdutoPorId(1);

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

    await expect(service.obterDetalheProdutoPorId(99)).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
  });

  it('deve registrar entrada de estoque', async () => {
    produtoRepository.exists.mockResolvedValue(true);
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

  it('deve registrar saída de estoque', async () => {
    produtoRepository.exists.mockResolvedValue(true);
    movimentacaoEstoqueRepository.save.mockResolvedValue(undefined);

    await service.saidaEstoque(1, 2, OrigemMovimentacaoEstoque.PERDA);

    expect(movimentacaoEstoqueRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.PERDA,
      }),
    );
  });

  it('deve lançar erro ao registrar entrada em produto inexistente', async () => {
    produtoRepository.exists.mockResolvedValue(false);

    await expect(
      service.entradaEstoque(99, 10, OrigemMovimentacaoEstoque.COMPRA),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
  });

  it('deve lançar erro ao registrar saída em produto inexistente', async () => {
    produtoRepository.exists.mockResolvedValue(false);

    await expect(
      service.saidaEstoque(99, 2, OrigemMovimentacaoEstoque.PERDA),
    ).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
  });
});
