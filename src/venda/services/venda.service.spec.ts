import { Carteira } from '@financeiro/entities';
import { InternalServerErrorException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('VendaService', () => {
  let service: VendaService;

  let carteiraRepository: {
    exists: jest.Mock;
  };
  let vendaRepository: {
    createQueryBuilder: jest.Mock;
  };
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    manager: { save: jest.Mock };
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };
  let dataSource: {
    createQueryRunner: jest.Mock;
  };

  beforeEach(async () => {
    carteiraRepository = {
      exists: jest.fn(),
    };
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([[Object.assign(new Venda(), { id: 1 })], 1]),
    };
    vendaRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: { save: jest.fn() },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendaService,
        {
          provide: getRepositoryToken(Carteira),
          useValue: carteiraRepository,
        },
        {
          provide: getRepositoryToken(Venda),
          useValue: vendaRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<VendaService>(VendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve verificar existência de carteira', async () => {
    carteiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeCarteira(7);

    expect(carteiraRepository.exists).toHaveBeenCalledWith({
      where: { id: 7, ativa: true },
    });
    expect(result).toBe(true);
  });

  it('deve inserir venda dentro de transação', async () => {
    const venda = Object.assign(new Venda(), { id: 1 });
    const movimentacoes = [{ idProduto: 1, quantidade: 2 }];

    const result = await service.inserirVenda(venda, movimentacoes as never[]);

    expect(dataSource.createQueryRunner).toHaveBeenCalled();
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.manager.save).toHaveBeenNthCalledWith(1, venda);
    expect(queryRunner.manager.save).toHaveBeenNthCalledWith(2, movimentacoes);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
    expect(result).toBe(venda);
  });

  it('deve fazer rollback ao falhar inserção da venda', async () => {
    const venda = Object.assign(new Venda(), { id: 1 });
    queryRunner.manager.save.mockRejectedValueOnce(new Error('falha'));

    await expect(service.inserirVenda(venda, [])).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir venda'),
    );

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('deve listar vendas paginadas', async () => {
    const result = await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(vendaRepository.createQueryBuilder).toHaveBeenCalledWith('venda');
    expect(result).toEqual({
      itens: [expect.objectContaining({ id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve listar vendas filtradas por tipo', async () => {
    await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
      tipo: TipoVenda.FEIRA,
    });

    const queryBuilder = vendaRepository.createQueryBuilder.mock.results[0]
      ?.value as {
      andWhere: jest.Mock;
    };
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.tipo = :tipo',
      expect.objectContaining({ tipo: TipoVenda.FEIRA }),
    );
  });

  it('deve listar vendas filtradas por termo', async () => {
    await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'pix',
    });

    const queryBuilder = vendaRepository.createQueryBuilder.mock.results[0]
      ?.value as {
      andWhere: jest.Mock;
    };
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('LIKE :termo'),
      expect.objectContaining({ termo: '%pix%' }),
    );
  });

  it('deve retornar totalPaginas mínimo 1 quando não há vendas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    vendaRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.listarVendas({ pagina: 1, tamanhoPagina: 10 });

    expect(result.totalPaginas).toBe(1);
  });
});
