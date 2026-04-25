import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanoAssinatura } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';

describe('PlanoService', () => {
  let service: PlanoService;
  let planoRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const makePlano = (
    overrides: Partial<PlanoAssinatura> = {},
  ): PlanoAssinatura =>
    Object.assign(new PlanoAssinatura(), {
      id: 1,
      nome: 'Plano Básico',
      descricao: 'Desc',
      valor: 4990,
      ativo: true,
      dataInclusao: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    planoRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanoService,
        {
          provide: getRepositoryToken(PlanoAssinatura),
          useValue: planoRepository,
        },
      ],
    }).compile();

    service = module.get<PlanoService>(PlanoService);
  });

  describe('salvarPlano', () => {
    it('deve salvar e retornar o plano', async () => {
      const plano = makePlano();
      planoRepository.save.mockResolvedValue(plano);

      const result = await service.salvarPlano(plano);

      expect(planoRepository.save).toHaveBeenCalledWith(plano);
      expect(result).toBe(plano);
    });

    it('deve lançar ConflictException quando nome duplicado', async () => {
      const plano = makePlano({ nome: 'Básico' });
      planoRepository.save.mockRejectedValue({
        driverError: { code: '23505' },
      });

      await expect(service.salvarPlano(plano)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros', async () => {
      const plano = makePlano();
      planoRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.salvarPlano(plano)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('listarPlanos', () => {
    it('deve retornar lista de planos ordenada por nome', async () => {
      const planos = [
        makePlano({ nome: 'A' }),
        makePlano({ id: 2, nome: 'B' }),
      ];
      planoRepository.find.mockResolvedValue(planos);

      const result = await service.listarPlanos();

      expect(planoRepository.find).toHaveBeenCalledWith({
        order: { nome: 'ASC' },
      });
      expect(result).toBe(planos);
    });
  });

  describe('listarPlanosAtivos', () => {
    it('deve retornar apenas os planos ativos ordenados por valor', async () => {
      const planos = [
        makePlano({ nome: 'Clube Criativo', ativo: true }),
        makePlano({ id: 2, nome: 'Colecao Akkai', ativo: true }),
      ];
      planoRepository.find.mockResolvedValue(planos);

      const result = await service.listarPlanosAtivos();

      expect(planoRepository.find).toHaveBeenCalledWith({
        where: { ativo: true },
        order: { valor: 'ASC' },
      });
      expect(result).toBe(planos);
    });
  });

  describe('pesquisarPlanos', () => {
    const makeQb = () => {
      const qb = {
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      planoRepository.createQueryBuilder.mockReturnValue(qb);
      return qb;
    };

    it('deve retornar resultado paginado sem filtros', async () => {
      const plano = makePlano();
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[plano], 1]);

      const result = await service.pesquisarPlanos({
        pagina: 1,
        tamanhoPagina: 10,
      });

      expect(result.itens).toHaveLength(1);
      expect(result.totalItens).toBe(1);
      expect(result.totalPaginas).toBe(1);
      expect(result.pagina).toBe(1);
    });

    it('deve aplicar filtro de termo', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarPlanos({
        pagina: 1,
        tamanhoPagina: 10,
        termo: 'Básico',
      });

      expect(qb.where).toHaveBeenCalledWith(
        expect.stringContaining('LOWER'),
        expect.objectContaining({ termo: '%básico%' }),
      );
    });

    it('deve calcular totalPaginas mínimo como 1 quando sem resultados', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.pesquisarPlanos({
        pagina: 1,
        tamanhoPagina: 10,
      });

      expect(result.totalPaginas).toBe(1);
    });
  });

  describe('obterPlanoPorId', () => {
    it('deve retornar o plano quando encontrado', async () => {
      const plano = makePlano();
      planoRepository.findOne.mockResolvedValue(plano);

      const result = await service.obterPlanoPorId(1);

      expect(planoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(plano);
    });

    it('deve retornar null quando não encontrado', async () => {
      planoRepository.findOne.mockResolvedValue(null);

      const result = await service.obterPlanoPorId(99);

      expect(result).toBeNull();
    });
  });

  describe('garantirPlanoPorId', () => {
    it('deve retornar o plano quando encontrado', async () => {
      const plano = makePlano();
      planoRepository.findOne.mockResolvedValue(plano);

      const result = await service.garantirPlanoPorId(1);

      expect(result).toBe(plano);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      planoRepository.findOne.mockResolvedValue(null);

      await expect(service.garantirPlanoPorId(99)).rejects.toThrow(
        new NotFoundException('Plano com ID 99 não encontrado.'),
      );
    });
  });

  describe('excluirPlano', () => {
    it('deve excluir o plano com sucesso', async () => {
      planoRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.excluirPlano(1)).resolves.toBeUndefined();
      expect(planoRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('deve lançar InternalServerErrorException ao falhar na exclusão', async () => {
      planoRepository.delete.mockRejectedValue(new Error('FK violation'));

      await expect(service.excluirPlano(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
