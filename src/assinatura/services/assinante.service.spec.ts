import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assinante, StatusAssinante } from '@assinatura/entities';
import { AssinanteService } from '@assinatura/services';

describe('AssinanteService', () => {
  let service: AssinanteService;
  let assinanteRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  const makeAssinante = (overrides: Partial<Assinante> = {}): Assinante =>
    Object.assign(new Assinante(), {
      id: 1,
      nome: 'João Silva',
      email: 'joao@email.com',
      idPlano: 1,
      status: StatusAssinante.ATIVO,
      dataInclusao: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    assinanteRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssinanteService,
        {
          provide: getRepositoryToken(Assinante),
          useValue: assinanteRepository,
        },
      ],
    }).compile();

    service = module.get<AssinanteService>(AssinanteService);
  });

  describe('salvarAssinante', () => {
    it('deve salvar e retornar o assinante', async () => {
      const assinante = makeAssinante();
      assinanteRepository.save.mockResolvedValue(assinante);

      const result = await service.salvarAssinante(assinante);

      expect(assinanteRepository.save).toHaveBeenCalledWith(assinante);
      expect(result).toBe(assinante);
    });

    it('deve lançar ConflictException em caso de conflito', async () => {
      const assinante = makeAssinante();
      assinanteRepository.save.mockRejectedValue({
        driverError: { code: '23505' },
      });

      await expect(service.salvarAssinante(assinante)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros', async () => {
      assinanteRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.salvarAssinante(makeAssinante())).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('pesquisarAssinantes', () => {
    const makeQb = () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      assinanteRepository.createQueryBuilder.mockReturnValue(qb);
      return qb;
    };

    it('deve retornar resultado paginado sem filtros', async () => {
      const assinante = makeAssinante();
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[assinante], 1]);

      const result = await service.pesquisarAssinantes({
        pagina: 1,
        tamanhoPagina: 10,
      });

      expect(result.itens).toHaveLength(1);
      expect(result.totalItens).toBe(1);
      expect(result.pagina).toBe(1);
      expect(result.tamanhoPagina).toBe(10);
    });

    it('deve aplicar filtro de termo', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarAssinantes({
        pagina: 1,
        tamanhoPagina: 10,
        termo: 'João',
      });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER'),
        expect.objectContaining({ termo: '%joão%' }),
      );
    });

    it('deve aplicar filtro de status', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarAssinantes({
        pagina: 1,
        tamanhoPagina: 10,
        status: StatusAssinante.ATIVO,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('assinante.status = :status', {
        status: StatusAssinante.ATIVO,
      });
    });

    it('deve aplicar filtro de idPlano', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarAssinantes({
        pagina: 1,
        tamanhoPagina: 10,
        idPlano: 3,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('assinante.idPlano = :idPlano', {
        idPlano: 3,
      });
    });

    it('deve calcular totalPaginas mínimo como 1', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.pesquisarAssinantes({
        pagina: 1,
        tamanhoPagina: 10,
      });

      expect(result.totalPaginas).toBe(1);
    });
  });

  describe('obterAssinantePorId', () => {
    it('deve retornar o assinante quando encontrado', async () => {
      const assinante = makeAssinante();
      assinanteRepository.findOne.mockResolvedValue(assinante);

      const result = await service.obterAssinantePorId(1);

      expect(assinanteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['plano'],
      });
      expect(result).toBe(assinante);
    });

    it('deve retornar null quando não encontrado', async () => {
      assinanteRepository.findOne.mockResolvedValue(null);

      const result = await service.obterAssinantePorId(99);

      expect(result).toBeNull();
    });
  });

  describe('garantirAssinantePorId', () => {
    it('deve retornar o assinante quando encontrado', async () => {
      const assinante = makeAssinante();
      assinanteRepository.findOne.mockResolvedValue(assinante);

      const result = await service.garantirAssinantePorId(1);

      expect(result).toBe(assinante);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      assinanteRepository.findOne.mockResolvedValue(null);

      await expect(service.garantirAssinantePorId(99)).rejects.toThrow(
        new NotFoundException('Assinante com ID 99 não encontrado.'),
      );
    });
  });

  describe('listarAssinantesPorPlano', () => {
    it('deve retornar assinantes ativos do plano ordenados por nome', async () => {
      const assinantes = [
        makeAssinante(),
        makeAssinante({ id: 2, nome: 'Maria' }),
      ];
      assinanteRepository.find.mockResolvedValue(assinantes);

      const result = await service.listarAssinantesPorPlano(1);

      expect(assinanteRepository.find).toHaveBeenCalledWith({
        where: { idPlano: 1, status: StatusAssinante.ATIVO },
        order: { nome: 'ASC' },
      });
      expect(result).toBe(assinantes);
    });

    it('deve retornar lista vazia quando plano não tem assinantes ativos', async () => {
      assinanteRepository.find.mockResolvedValue([]);

      const result = await service.listarAssinantesPorPlano(99);

      expect(result).toHaveLength(0);
    });
  });

  describe('excluirAssinante', () => {
    it('deve excluir o assinante com sucesso', async () => {
      assinanteRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.excluirAssinante(1)).resolves.toBeUndefined();
      expect(assinanteRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('deve lançar InternalServerErrorException ao falhar na exclusão', async () => {
      assinanteRepository.delete.mockRejectedValue(new Error('FK violation'));

      await expect(service.excluirAssinante(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
