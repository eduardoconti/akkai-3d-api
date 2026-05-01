import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CicloAssinatura, StatusCiclo } from '@assinatura/entities';
import { CicloService } from '@assinatura/services';

describe('CicloService', () => {
  let service: CicloService;
  let cicloRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let dataSource: { createQueryRunner: jest.Mock };

  const makeCiclo = (
    overrides: Partial<CicloAssinatura> = {},
  ): CicloAssinatura =>
    Object.assign(new CicloAssinatura(), {
      id: 1,
      idAssinante: 1,
      mesReferencia: 4,
      anoReferencia: 2026,
      status: StatusCiclo.PENDENTE,
      itens: [],
      dataInclusao: new Date(),
      ...overrides,
    });

  const makeQueryRunner = (executeResults: unknown[] = []) => {
    const execute = jest.fn();
    executeResults.forEach((r, i) => {
      if (r instanceof Error) {
        execute.mockRejectedValueOnce(r);
      } else {
        execute.mockResolvedValueOnce(r);
      }
      void i;
    });

    const qb = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute,
    };

    const queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      manager: { createQueryBuilder: jest.fn().mockReturnValue(qb) },
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    return { queryRunner, qb };
  };

  beforeEach(async () => {
    cicloRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    dataSource = { createQueryRunner: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CicloService,
        {
          provide: getRepositoryToken(CicloAssinatura),
          useValue: cicloRepository,
        },
        { provide: DataSource, useValue: dataSource },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn(() => 100) },
        },
      ],
    }).compile();

    service = module.get<CicloService>(CicloService);
  });

  describe('salvarCiclo', () => {
    it('deve salvar e retornar o ciclo', async () => {
      const ciclo = makeCiclo();
      cicloRepository.save.mockResolvedValue(ciclo);

      const result = await service.salvarCiclo(ciclo);

      expect(cicloRepository.save).toHaveBeenCalledWith(ciclo);
      expect(result).toBe(ciclo);
    });

    it('deve lançar ConflictException quando ciclo duplicado', async () => {
      cicloRepository.save.mockRejectedValue({
        driverError: { code: '23505' },
      });

      await expect(service.salvarCiclo(makeCiclo())).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros', async () => {
      cicloRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.salvarCiclo(makeCiclo())).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('inserirCiclosEmLote', () => {
    const itensTemplate = [{ idProduto: 1, quantidade: 1 }];

    it('deve inserir ciclos e itens em lote e retornar contadores', async () => {
      const { queryRunner } = makeQueryRunner([
        { raw: [{ id: 10 }, { id: 11 }] }, // INSERT ciclos
        undefined, // INSERT itens
      ]);
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      const result = await service.inserirCiclosEmLote(
        [1, 2],
        4,
        2026,
        itensTemplate,
      );

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toEqual({ criados: 2, ignorados: 0 });
    });

    it('deve contabilizar ciclos ignorados por conflito', async () => {
      const { queryRunner } = makeQueryRunner([
        { raw: [{ id: 10 }] }, // somente 1 de 3 inserido
        undefined,
      ]);
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      const result = await service.inserirCiclosEmLote(
        [1, 2, 3],
        4,
        2026,
        itensTemplate,
      );

      expect(result).toEqual({ criados: 1, ignorados: 2 });
    });

    it('deve pular inserção de itens quando nenhum ciclo foi inserido', async () => {
      const { queryRunner, qb } = makeQueryRunner([
        { raw: [] }, // nenhum ciclo inserido
      ]);
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      const result = await service.inserirCiclosEmLote(
        [1],
        4,
        2026,
        itensTemplate,
      );

      expect(qb.execute).toHaveBeenCalledTimes(1); // somente o INSERT de ciclos
      expect(result).toEqual({ criados: 0, ignorados: 1 });
    });

    it('deve pular inserção de itens quando template está vazio', async () => {
      const { queryRunner, qb } = makeQueryRunner([{ raw: [{ id: 10 }] }]);
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      const result = await service.inserirCiclosEmLote([1], 4, 2026, []);

      expect(qb.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ criados: 1, ignorados: 0 });
    });

    it('deve fazer rollback e lançar InternalServerErrorException ao falhar', async () => {
      const { queryRunner } = makeQueryRunner([new Error('DB error')]);
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      await expect(
        service.inserirCiclosEmLote([1], 4, 2026, itensTemplate),
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('deve processar em múltiplos lotes quando há mais de 100 assinantes', async () => {
      const ids = Array.from({ length: 150 }, (_, i) => i + 1);

      const { queryRunner: qr1 } = makeQueryRunner([
        { raw: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })) },
        undefined,
      ]);
      const { queryRunner: qr2 } = makeQueryRunner([
        { raw: Array.from({ length: 50 }, (_, i) => ({ id: i + 101 })) },
        undefined,
      ]);

      dataSource.createQueryRunner
        .mockReturnValueOnce(qr1)
        .mockReturnValueOnce(qr2);

      const result = await service.inserirCiclosEmLote(
        ids,
        4,
        2026,
        itensTemplate,
      );

      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ criados: 150, ignorados: 0 });
    });
  });

  describe('pesquisarCiclos', () => {
    const makeQb = () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      cicloRepository.createQueryBuilder.mockReturnValue(qb);
      return qb;
    };

    it('deve retornar resultado paginado sem filtros', async () => {
      const ciclo = makeCiclo();
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[ciclo], 1]);

      const result = await service.pesquisarCiclos({
        pagina: 1,
        tamanhoPagina: 10,
      });

      expect(result.itens).toHaveLength(1);
      expect(result.totalItens).toBe(1);
      expect(result.totalPaginas).toBe(1);
    });

    it('deve aplicar filtro de idAssinante', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarCiclos({
        pagina: 1,
        tamanhoPagina: 10,
        idAssinante: 5,
      });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'ciclo.idAssinante = :idAssinante',
        { idAssinante: 5 },
      );
    });

    it('deve aplicar filtro de status', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarCiclos({
        pagina: 1,
        tamanhoPagina: 10,
        status: StatusCiclo.ENVIADO,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('ciclo.status = :status', {
        status: StatusCiclo.ENVIADO,
      });
    });

    it('deve aplicar filtro de mes e ano', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarCiclos({
        pagina: 1,
        tamanhoPagina: 10,
        mes: 4,
        ano: 2026,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('ciclo.mesReferencia = :mes', {
        mes: 4,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('ciclo.anoReferencia = :ano', {
        ano: 2026,
      });
    });
  });

  describe('obterCicloPorId', () => {
    it('deve retornar o ciclo quando encontrado', async () => {
      const ciclo = makeCiclo();
      cicloRepository.findOne.mockResolvedValue(ciclo);

      const result = await service.obterCicloPorId(1);

      expect(cicloRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['assinante', 'itens', 'itens.produto'],
      });
      expect(result).toBe(ciclo);
    });

    it('deve retornar null quando não encontrado', async () => {
      cicloRepository.findOne.mockResolvedValue(null);

      const result = await service.obterCicloPorId(99);

      expect(result).toBeNull();
    });
  });

  describe('garantirCicloPorId', () => {
    it('deve retornar o ciclo quando encontrado', async () => {
      const ciclo = makeCiclo();
      cicloRepository.findOne.mockResolvedValue(ciclo);

      const result = await service.garantirCicloPorId(1);

      expect(result).toBe(ciclo);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      cicloRepository.findOne.mockResolvedValue(null);

      await expect(service.garantirCicloPorId(99)).rejects.toThrow(
        new NotFoundException('Ciclo com ID 99 não encontrado.'),
      );
    });
  });

  describe('excluirCiclo', () => {
    it('deve excluir o ciclo com sucesso', async () => {
      cicloRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.excluirCiclo(1)).resolves.toBeUndefined();
      expect(cicloRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('deve lançar InternalServerErrorException ao falhar na exclusão', async () => {
      cicloRepository.delete.mockRejectedValue(new Error('FK violation'));

      await expect(service.excluirCiclo(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
