import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Despesa } from '@financeiro/entities';
import { DespesaService } from './despesa.service';
import { DateService } from '@common/services/date.service';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

describe('DespesaService', () => {
  let service: DespesaService;
  let despesaRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder?: jest.Mock;
  };
  const dateServiceMock = {
    toUtcDateRange: (d: string) => ({
      start: `${d} 00:00:00.000`,
      end: `${d} 23:59:59.999`,
    }),
  };

  beforeEach(async () => {
    despesaRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DespesaService,
        {
          provide: getRepositoryToken(Despesa),
          useValue: despesaRepository,
        },
        {
          provide: DateService,
          useValue: dateServiceMock,
        },
      ],
    }).compile();

    service = module.get<DespesaService>(DespesaService);
  });

  it('deve lançar erro ao falhar inserção da despesa', async () => {
    despesaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirDespesa(new Despesa())).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir despesa'),
    );
  });

  it('deve obter despesa por id', async () => {
    const despesa = Object.assign(new Despesa(), { id: 5 });
    despesaRepository.findOne.mockResolvedValue(despesa);

    const result = await service.obterDespesaPorId(5);

    expect(despesaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 5 },
    });
    expect(result).toBe(despesa);
  });

  it('deve retornar null quando despesa não existir em obterDespesaPorId', async () => {
    despesaRepository.findOne.mockResolvedValue(null);

    const result = await service.obterDespesaPorId(99);

    expect(result).toBeNull();
  });

  it('deve garantir despesa por id retornando a despesa', async () => {
    const despesa = Object.assign(new Despesa(), { id: 5 });
    despesaRepository.findOne.mockResolvedValue(despesa);

    const result = await service.garantirDespesaPorId(5);

    expect(result).toBe(despesa);
  });

  it('deve lançar NotFoundException quando despesa não existir em garantirDespesaPorId', async () => {
    despesaRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirDespesaPorId(99)).rejects.toThrow(
      new NotFoundException('Despesa com ID 99 não encontrada.'),
    );
  });

  it('deve alterar despesa com sucesso', async () => {
    const despesa = Object.assign(new Despesa(), {
      id: 5,
      descricao: 'Aluguel',
      valor: 150000,
      idCategoria: 1,
      meioPagamento: MeioPagamento.PIX,
      idCarteira: 1,
    });
    despesaRepository.update.mockResolvedValue(undefined);

    const result = await service.alterarDespesa(despesa);

    expect(despesaRepository.update).toHaveBeenCalledWith(
      5,
      expect.not.objectContaining({ id: 5 }),
    );
    expect(result).toBe(despesa);
  });

  it('deve lançar InternalServerErrorException ao falhar alteração da despesa', async () => {
    const despesa = Object.assign(new Despesa(), {
      id: 5,
      descricao: 'Aluguel',
    });
    despesaRepository.update.mockRejectedValue(new Error('falha'));

    await expect(service.alterarDespesa(despesa)).rejects.toThrow(
      new InternalServerErrorException('Erro ao alterar despesa'),
    );
  });

  it('deve excluir despesa com sucesso', async () => {
    despesaRepository.delete.mockResolvedValue(undefined);

    await service.excluirDespesa(5);

    expect(despesaRepository.delete).toHaveBeenCalledWith({ id: 5 });
  });

  it('deve lançar InternalServerErrorException ao falhar exclusão da despesa', async () => {
    despesaRepository.delete.mockRejectedValue(new Error('falha'));

    await expect(service.excluirDespesa(5)).rejects.toThrow(
      new InternalServerErrorException('Erro ao excluir despesa'),
    );
  });

  it('deve listar despesas sem filtro de termo', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ valorTotal: '150000' }),
      getMany: jest.fn().mockResolvedValue([new Despesa()]),
      getCount: jest.fn().mockResolvedValue(1),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
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
    expect(result.totalizadores.valorTotal).toBe(150000);
  });

  it('deve listar despesas com filtros de termo e datas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ valorTotal: '0' }),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
    despesaRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    await service.listarDespesas({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'aluguel',
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31',
      idsCategorias: [1, 3],
      idFeira: 9,
    });

    expect(queryBuilder.andWhere).toHaveBeenLastCalledWith(
      'despesa.idFeira = :idFeira',
      { idFeira: 9 },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      4,
      'despesa.idCategoria IN (:...idsCategorias)',
      { idsCategorias: [1, 3] },
    );
  });

  it('deve retornar totalPaginas mínimo 1 quando não há despesas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ valorTotal: '0' }),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
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
