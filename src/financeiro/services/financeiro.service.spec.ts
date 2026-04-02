import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Carteira, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

describe('FinanceiroService', () => {
  let service: FinanceiroService;
  let carteiraRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    findOne: jest.Mock;
  };
  let despesaRepository: { save: jest.Mock; createQueryBuilder?: jest.Mock };
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    carteiraRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      findOne: jest.fn(),
    };
    despesaRepository = {
      save: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceiroService,
        {
          provide: getRepositoryToken(Carteira),
          useValue: carteiraRepository,
        },
        {
          provide: getRepositoryToken(Despesa),
          useValue: despesaRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<FinanceiroService>(FinanceiroService);
  });

  it('deve salvar carteira com sucesso', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
    });
    carteiraRepository.save.mockResolvedValue(carteira);

    const result = await service.salvarCarteira(carteira);

    expect(result).toBe(carteira);
  });

  it('deve obter carteira por id', async () => {
    carteiraRepository.findOne.mockResolvedValue({ id: 1 });

    const result = await service.obterCarteiraPorId(1);

    expect(carteiraRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({ id: 1 });
  });

  it('deve lançar erro ao falhar inserção da despesa', async () => {
    despesaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirDespesa(new Despesa())).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir despesa'),
    );
  });

  it('deve listar carteiras com saldo atual', async () => {
    dataSource.query.mockResolvedValue([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: '12000',
      },
    ]);

    const result = await service.listarCarteiras();

    expect(result).toEqual([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: 12000,
      },
    ]);
  });

  it('deve lançar ConflictException ao salvar carteira com nome duplicado', async () => {
    const carteira = Object.assign(new Carteira(), { nome: 'CAIXA' });
    carteiraRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvarCarteira(carteira)).rejects.toThrow(
      new ConflictException('Carteira CAIXA já existe'),
    );
  });

  it('deve lançar InternalServerErrorException ao falhar salvamento de carteira', async () => {
    const carteira = Object.assign(new Carteira(), { nome: 'CAIXA' });
    carteiraRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvarCarteira(carteira)).rejects.toThrow(
      new InternalServerErrorException('Erro ao salvar carteira'),
    );
  });

  it('deve verificar existência de carteira ativa', async () => {
    carteiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeCarteira(3);

    expect(carteiraRepository.exists).toHaveBeenCalledWith({
      where: { id: 3, ativa: true },
    });
    expect(result).toBe(true);
  });

  it('deve listar despesas sem filtro de termo', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[new Despesa()], 1]),
    };
    despesaRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    const result = await service.listarDespesas({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result.totalItens).toBe(1);
    expect(result.totalPaginas).toBe(1);
  });

  it('deve listar despesas com filtros de termo e datas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    despesaRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    await service.listarDespesas({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'aluguel',
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31',
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
  });

  it('deve retornar totalPaginas minimo 1 quando não há despesas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    despesaRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    const result = await service.listarDespesas({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.totalPaginas).toBe(1);
  });
});
