import { InternalServerErrorException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('VendaService', () => {
  let service: VendaService;

  let vendaRepository: {
    find: jest.Mock;
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
    vendaRepository = {
      find: jest.fn(),
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

  it('deve listar vendas com itens e produto ordenadas', async () => {
    const vendas = [Object.assign(new Venda(), { id: 1 })];
    vendaRepository.find.mockResolvedValue(vendas);

    const result = await service.listarVendas();

    expect(vendaRepository.find).toHaveBeenCalledWith({
      relations: { itens: { produto: true } },
      order: { id: 'DESC' },
      take: 10,
    });
    expect(result).toBe(vendas);
  });
});
