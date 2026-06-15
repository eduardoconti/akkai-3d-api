import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from '@common/services/date.service';
import { TransferenciaCarteira } from '@financeiro/entities';
import { TransferenciaCarteiraService } from './transferencia-carteira.service';

describe('TransferenciaCarteiraService', () => {
  let service: TransferenciaCarteiraService;
  let transferenciaCarteiraRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder?: jest.Mock;
  };
  const dateServiceMock = {
    toUtcDateRange: (data: string) => ({
      start: `${data} 00:00:00.000`,
      end: `${data} 23:59:59.999`,
    }),
  };

  beforeEach(async () => {
    transferenciaCarteiraRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferenciaCarteiraService,
        {
          provide: getRepositoryToken(TransferenciaCarteira),
          useValue: transferenciaCarteiraRepository,
        },
        {
          provide: DateService,
          useValue: dateServiceMock,
        },
      ],
    }).compile();

    service = module.get<TransferenciaCarteiraService>(
      TransferenciaCarteiraService,
    );
  });

  it('deve inserir transferência de carteira', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), {
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
    });
    const transferenciaPersistida = Object.assign(new TransferenciaCarteira(), {
      ...transferencia,
      id: 1,
    });
    transferenciaCarteiraRepository.save.mockResolvedValue(
      transferenciaPersistida,
    );

    const result = await service.inserirTransferenciaCarteira(transferencia);

    expect(transferenciaCarteiraRepository.save).toHaveBeenCalledWith(
      transferencia,
    );
    expect(result).toBe(transferenciaPersistida);
  });

  it('deve lançar erro interno ao falhar inserção de transferência', async () => {
    transferenciaCarteiraRepository.save.mockRejectedValue(new Error('falha'));

    await expect(
      service.inserirTransferenciaCarteira(new TransferenciaCarteira()),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'Erro ao inserir transferência de carteira',
      ),
    );
  });

  it('deve listar transferências por carteira ordenadas pelas mais recentes', async () => {
    const transferencias = [
      Object.assign(new TransferenciaCarteira(), { id: 1 }),
    ];
    transferenciaCarteiraRepository.find.mockResolvedValue(transferencias);

    const result = await service.listarTransferenciasPorCarteira(3);

    expect(transferenciaCarteiraRepository.find).toHaveBeenCalledWith({
      where: [{ idCarteiraOrigem: 3 }, { idCarteiraDestino: 3 }],
      relations: {
        carteiraOrigem: true,
        carteiraDestino: true,
      },
      order: { dataTransferencia: 'DESC', id: 'DESC' },
    });
    expect(result).toBe(transferencias);
  });

  it('deve obter transferência por id', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), { id: 7 });
    transferenciaCarteiraRepository.findOne.mockResolvedValue(transferencia);

    const result = await service.obterTransferenciaPorId(7);

    expect(transferenciaCarteiraRepository.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(result).toBe(transferencia);
  });

  it('deve garantir transferência por id retornando a transferência', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), { id: 7 });
    transferenciaCarteiraRepository.findOne.mockResolvedValue(transferencia);

    const result = await service.garantirTransferenciaPorId(7);

    expect(result).toBe(transferencia);
  });

  it('deve lançar NotFoundException quando transferência não existir', async () => {
    transferenciaCarteiraRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirTransferenciaPorId(99)).rejects.toThrow(
      new NotFoundException('Transferência com ID 99 não encontrada.'),
    );
  });

  it('deve alterar transferência de carteira', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), {
      id: 7,
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 12000,
    });
    transferenciaCarteiraRepository.update.mockResolvedValue(undefined);

    const result = await service.alterarTransferenciaCarteira(transferencia);

    expect(transferenciaCarteiraRepository.update).toHaveBeenCalledWith(
      7,
      expect.not.objectContaining({ id: 7 }),
    );
    expect(result).toBe(transferencia);
  });

  it('deve lançar erro interno ao falhar alteração de transferência', async () => {
    transferenciaCarteiraRepository.update.mockRejectedValue(
      new Error('falha'),
    );

    await expect(
      service.alterarTransferenciaCarteira(
        Object.assign(new TransferenciaCarteira(), { id: 7 }),
      ),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'Erro ao alterar transferência de carteira',
      ),
    );
  });

  it('deve excluir transferência de carteira', async () => {
    transferenciaCarteiraRepository.delete.mockResolvedValue(undefined);

    await service.excluirTransferenciaCarteira(7);

    expect(transferenciaCarteiraRepository.delete).toHaveBeenCalledWith({
      id: 7,
    });
  });

  it('deve lançar erro interno ao falhar exclusão de transferência', async () => {
    transferenciaCarteiraRepository.delete.mockRejectedValue(
      new Error('falha'),
    );

    await expect(service.excluirTransferenciaCarteira(7)).rejects.toThrow(
      new InternalServerErrorException(
        'Erro ao excluir transferência de carteira',
      ),
    );
  });

  it('deve pesquisar transferências com paginação sem filtros opcionais', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      getMany: jest.fn().mockResolvedValue([new TransferenciaCarteira()]),
      getCount: jest.fn().mockResolvedValue(1),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
    transferenciaCarteiraRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    const result = await service.pesquisarTransferencias({
      pagina: 2,
      tamanhoPagina: 10,
    });

    expect(
      transferenciaCarteiraRepository.createQueryBuilder,
    ).toHaveBeenCalledWith('transferencia');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'transferencia.dataTransferencia',
      'DESC',
    );
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
      'transferencia.id',
      'DESC',
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    expect(result.totalItens).toBe(1);
    expect(result.totalPaginas).toBe(1);
  });

  it('deve pesquisar transferências com filtros de período, origem e destino', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
    transferenciaCarteiraRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    const result = await service.pesquisarTransferencias({
      pagina: 1,
      tamanhoPagina: 10,
      termo: 'caixa',
      dataInicio: '2026-06-01',
      dataFim: '2026-06-30',
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
    });

    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'transferencia.dataTransferencia >= :dataInicio',
      { dataInicio: '2026-06-01 00:00:00.000' },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      'transferencia.dataTransferencia <= :dataFim',
      { dataFim: '2026-06-30 23:59:59.999' },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      4,
      'transferencia.idCarteiraOrigem = :idCarteiraOrigem',
      { idCarteiraOrigem: 1 },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      5,
      'transferencia.idCarteiraDestino = :idCarteiraDestino',
      { idCarteiraDestino: 2 },
    );
    expect(result.totalPaginas).toBe(1);
  });
});
