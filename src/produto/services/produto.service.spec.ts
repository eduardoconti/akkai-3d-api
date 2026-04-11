import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from '@produto/entities';
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
  let dataSource: {
    query: jest.Mock;
  };

  beforeEach(async () => {
    produtoRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
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

  it('deve listar produtos sem retornar saldo de estoque', async () => {
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

  it('deve listar estoque sem retornar valor do produto', async () => {
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

    const result = await service.listarEstoque({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result).toEqual({
      itens: [
        {
          id: 1,
          nome: 'Caneca',
          codigo: 'CAN001',
          descricao: 'Modelo geek',
          idCategoria: 2,
          estoqueMinimo: 3,
          categoria: { id: 2, nome: 'Canecas' },
          quantidadeEstoque: 9,
        },
      ],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
    expect(result.itens[0]).not.toHaveProperty('valor');
  });

  it('deve listar produtos filtrando por termo', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: '1' }])
      .mockResolvedValueOnce([]);

    await service.listarProdutos({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'Caneca',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE'),
      expect.arrayContaining(['%caneca%']),
    );
  });

  it('deve ordenar estoque por quantidade quando solicitado', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: '0' }])
      .mockResolvedValueOnce([]);

    await service.listarEstoque({
      pagina: 1,
      tamanhoPagina: 10,
      ordenarPor: 'quantidade',
      direcao: 'desc',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        'ORDER BY COALESCE(e.quantidade_estoque, 0) DESC',
      ),
      expect.any(Array),
    );
  });

  it('deve ordenar estoque por nível do estoque quando solicitado', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ total: '0' }])
      .mockResolvedValueOnce([]);

    await service.listarEstoque({
      pagina: 1,
      tamanhoPagina: 10,
      ordenarPor: 'nivelEstoque',
      direcao: 'asc',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        'WHEN COALESCE(e.quantidade_estoque, 0) < 0 THEN 0',
      ),
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

  it('deve retornar produto em garantirExisteProduto', async () => {
    const produto = Object.assign(new Produto(), { id: 1 });
    produtoRepository.findOne.mockResolvedValue(produto);

    const result = await service.garantirExisteProduto(1);

    expect(result).toBe(produto);
  });

  it('deve lançar NotFoundException em garantirExisteProduto quando não existe', async () => {
    produtoRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirExisteProduto(99)).rejects.toThrow(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );
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

  it('deve verificar existência de produto', async () => {
    produtoRepository.exists.mockResolvedValue(true);

    const result = await service.existeProduto(7);

    expect(produtoRepository.exists).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(result).toBe(true);
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
});
