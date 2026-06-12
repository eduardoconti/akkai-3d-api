import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { PrecoProdutoFeira } from '@venda/entities';
import { FeiraService, PrecoProdutoFeiraService } from '@venda/services';

describe('PrecoProdutoFeiraService', () => {
  let service: PrecoProdutoFeiraService;
  let precoProdutoFeiraRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let garantirExisteFeiraMock: jest.Mock;
  let garantirExisteProdutoMock: jest.Mock;

  beforeEach(async () => {
    precoProdutoFeiraRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    garantirExisteFeiraMock = jest.fn();
    garantirExisteProdutoMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrecoProdutoFeiraService,
        {
          provide: getRepositoryToken(PrecoProdutoFeira),
          useValue: precoProdutoFeiraRepository,
        },
        {
          provide: FeiraService,
          useValue: {
            garantirExisteFeira: garantirExisteFeiraMock,
          },
        },
        {
          provide: ProdutoService,
          useValue: {
            garantirExisteProduto: garantirExisteProdutoMock,
          },
        },
      ],
    }).compile();

    service = module.get<PrecoProdutoFeiraService>(PrecoProdutoFeiraService);
  });

  it('deve listar preços por feira com produto', async () => {
    const precos = [
      Object.assign(new PrecoProdutoFeira(), {
        id: 1,
        idFeira: 3,
        idProduto: 10,
        valor: 1500,
      }),
    ];
    const queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(precos),
    };
    precoProdutoFeiraRepository.createQueryBuilder.mockReturnValue(
      queryBuilder,
    );

    const result = await service.listarPorFeira(3);

    expect(garantirExisteFeiraMock).toHaveBeenCalledWith(3);
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'preco.produto',
      'produto',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'preco.idFeira = :idFeira',
      { idFeira: 3 },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('produto.nome', 'ASC');
    expect(result).toBe(precos);
  });

  it('deve pesquisar preços paginados filtrando por feira e produto', async () => {
    const precos = [
      Object.assign(new PrecoProdutoFeira(), {
        id: 1,
        idFeira: 3,
        idProduto: 10,
        valor: 1500,
      }),
    ];
    const queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([precos, 1]),
    };
    precoProdutoFeiraRepository.createQueryBuilder.mockReturnValue(
      queryBuilder,
    );

    const result = await service.pesquisarPrecos({
      pagina: 2,
      tamanhoPagina: 10,
      idFeira: 3,
      termo: 'caneca',
      ordenarPor: 'codigo',
      direcao: 'desc',
    });

    expect(precoProdutoFeiraRepository.createQueryBuilder).toHaveBeenCalledWith(
      'preco',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'preco.produto',
      'produto',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'preco.feira',
      'feira',
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('produto.codigo', 'DESC');
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('produto.nome', 'ASC');
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('feira.nome', 'ASC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'preco.idFeira = :idFeira',
      { idFeira: 3 },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(LOWER(produto.nome) LIKE :termo OR CAST(produto.codigo AS text) LIKE :termo)',
      { termo: '%caneca%' },
    );
    expect(result).toEqual({
      itens: precos,
      pagina: 2,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve criar preço para produto na feira', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 10, valor: 1000 }),
    );
    precoProdutoFeiraRepository.findOne.mockResolvedValue(null);
    precoProdutoFeiraRepository.save.mockImplementation(
      (preco: PrecoProdutoFeira) =>
        Promise.resolve(
          Object.assign(preco, {
            id: 1,
          }),
        ),
    );

    const result = await service.salvarPreco(3, {
      idProduto: 10,
      valor: 1500,
    });

    expect(garantirExisteFeiraMock).toHaveBeenCalledWith(3);
    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(10);
    expect(precoProdutoFeiraRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idFeira: 3,
        idProduto: 10,
        valor: 1500,
      }),
    );
    expect(result.id).toBe(1);
  });

  it('deve atualizar preço existente para produto na feira', async () => {
    const preco = Object.assign(new PrecoProdutoFeira(), {
      id: 2,
      idFeira: 3,
      idProduto: 10,
      valor: 1200,
    });

    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 10, valor: 1000 }),
    );
    precoProdutoFeiraRepository.findOne.mockResolvedValue(preco);
    precoProdutoFeiraRepository.save.mockImplementation(
      (precoSalvo: PrecoProdutoFeira) => Promise.resolve(precoSalvo),
    );

    const result = await service.salvarPreco(3, {
      idProduto: 10,
      valor: 1800,
    });

    expect(result.valor).toBe(1800);
    expect(precoProdutoFeiraRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        valor: 1800,
      }),
    );
  });

  it('deve lançar ConflictException em preço duplicado salvo em corrida', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 10, valor: 1000 }),
    );
    precoProdutoFeiraRepository.findOne.mockResolvedValue(null);
    precoProdutoFeiraRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(
      service.salvarPreco(3, { idProduto: 10, valor: 1500 }),
    ).rejects.toThrow(
      new ConflictException('Preço do produto já cadastrado para esta feira'),
    );
  });

  it('deve excluir preço por feira e produto', async () => {
    precoProdutoFeiraRepository.delete.mockResolvedValue({ affected: 1 });

    await service.excluirPreco(3, 10);

    expect(precoProdutoFeiraRepository.delete).toHaveBeenCalledWith({
      idFeira: 3,
      idProduto: 10,
    });
  });

  it('deve lançar erro interno ao falhar exclusão do preço', async () => {
    precoProdutoFeiraRepository.delete.mockRejectedValue(new Error('falha'));

    await expect(service.excluirPreco(3, 10)).rejects.toThrow(
      new InternalServerErrorException(
        'Erro ao excluir preço do produto na feira',
      ),
    );
  });

  it('deve usar preço do produto quando feira não for informada', async () => {
    const produto = Object.assign(new Produto(), { id: 10, valor: 1000 });

    const result = await service.obterValorProdutoParaFeira(undefined, produto);

    expect(result).toBe(1000);
    expect(precoProdutoFeiraRepository.findOne).not.toHaveBeenCalled();
  });

  it('deve usar preço específico quando existir para a feira', async () => {
    const produto = Object.assign(new Produto(), { id: 10, valor: 1000 });
    precoProdutoFeiraRepository.findOne.mockResolvedValue({ valor: 1600 });

    const result = await service.obterValorProdutoParaFeira(3, produto);

    expect(precoProdutoFeiraRepository.findOne).toHaveBeenCalledWith({
      select: {
        valor: true,
      },
      where: {
        idFeira: 3,
        idProduto: 10,
      },
    });
    expect(result).toBe(1600);
  });

  it('deve usar preço padrão do produto quando não existir preço específico', async () => {
    const produto = Object.assign(new Produto(), { id: 10, valor: 1000 });
    precoProdutoFeiraRepository.findOne.mockResolvedValue(null);

    const result = await service.obterValorProdutoParaFeira(3, produto);

    expect(result).toBe(1000);
  });
});
