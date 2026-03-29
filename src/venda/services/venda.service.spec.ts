import { InternalServerErrorException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Feira, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('VendaService', () => {
  let service: VendaService;

  let feiraRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    find: jest.Mock;
  };
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
    feiraRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      find: jest.fn(),
    };
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
          provide: getRepositoryToken(Feira),
          useValue: feiraRepository,
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

  it('deve inserir feira com sucesso', async () => {
    const feira = Object.assign(new Feira(), {
      id: 1,
      nome: 'Teatro Reviver',
    });
    feiraRepository.save.mockResolvedValue(feira);

    const result = await service.inserirFeira(feira);

    expect(feiraRepository.save).toHaveBeenCalledWith(feira);
    expect(result).toBe(feira);
  });

  it('deve lançar erro ao falhar inserção da feira', async () => {
    const feira = Object.assign(new Feira(), {
      nome: 'Teatro Reviver',
    });
    feiraRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirFeira(feira)).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir feira'),
    );
  });

  it('deve verificar existência de feira', async () => {
    feiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeFeira(5);

    expect(feiraRepository.exists).toHaveBeenCalledWith({
      where: { id: 5 },
    });
    expect(result).toBe(true);
  });

  it('deve listar feiras ordenadas por nome', async () => {
    const feiras = [Object.assign(new Feira(), { id: 1 })];
    feiraRepository.find = jest.fn().mockResolvedValue(feiras);

    const result = await service.listarFeiras();

    expect(feiraRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
    expect(result).toBe(feiras);
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
      relations: { itens: { produto: true }, feira: true },
      order: { id: 'DESC' },
      take: 10,
    });
    expect(result).toBe(vendas);
  });
});
