import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Carteira, CategoriaDespesa, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

describe('FinanceiroService', () => {
  let service: FinanceiroService;
  let carteiraRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    findOne: jest.Mock;
  };
  let despesaRepository: { save: jest.Mock; createQueryBuilder?: jest.Mock };
  let categoriaDespesaRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    exists: jest.Mock;
  };
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
    categoriaDespesaRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
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
          provide: getRepositoryToken(CategoriaDespesa),
          useValue: categoriaDespesaRepository,
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

  it('deve salvar categoria de despesa com sucesso', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Matéria-prima',
    });
    categoriaDespesaRepository.save.mockResolvedValue(categoria);

    const result = await service.salvarCategoriaDespesa(categoria);

    expect(result).toBe(categoria);
  });

  it('deve lançar ConflictException ao salvar categoria com nome duplicado', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      nome: 'Embalagem',
    });
    categoriaDespesaRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvarCategoriaDespesa(categoria)).rejects.toThrow(
      new ConflictException('Categoria Embalagem já existe'),
    );
  });

  it('deve listar categorias de despesa ordenadas por nome', async () => {
    const categorias = [
      Object.assign(new CategoriaDespesa(), { id: 1, nome: 'Embalagem' }),
      Object.assign(new CategoriaDespesa(), { id: 2, nome: 'Transporte' }),
    ];
    categoriaDespesaRepository.find.mockResolvedValue(categorias);

    const result = await service.listarCategoriasDespesa();

    expect(categoriaDespesaRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
    expect(result).toBe(categorias);
  });

  it('deve lançar NotFoundException ao garantir categoria inexistente por id', async () => {
    categoriaDespesaRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirCategoriaDespesaPorId(99)).rejects.toThrow(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );
  });

  it('deve garantir existência de categoria de despesa', async () => {
    categoriaDespesaRepository.exists.mockResolvedValue(true);

    await expect(
      service.garantirExisteCategoriaDespesa(1),
    ).resolves.not.toThrow();
  });

  it('deve lançar NotFoundException ao garantir existência de categoria inexistente', async () => {
    categoriaDespesaRepository.exists.mockResolvedValue(false);

    await expect(service.garantirExisteCategoriaDespesa(99)).rejects.toThrow(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );
  });
});
