import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemKitMensal, KitMensal } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';

describe('KitMensalService', () => {
  let service: KitMensalService;
  let kitRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let itemKitRepository: {
    delete: jest.Mock;
  };

  const makeKit = (overrides: Partial<KitMensal> = {}): KitMensal =>
    Object.assign(new KitMensal(), {
      id: 1,
      idPlano: 1,
      mesReferencia: 4,
      anoReferencia: 2026,
      itens: [],
      dataInclusao: new Date(),
      ...overrides,
    });

  beforeEach(async () => {
    kitRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    itemKitRepository = { delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitMensalService,
        { provide: getRepositoryToken(KitMensal), useValue: kitRepository },
        { provide: getRepositoryToken(ItemKitMensal), useValue: itemKitRepository },
      ],
    }).compile();

    service = module.get<KitMensalService>(KitMensalService);
  });

  describe('salvarKit', () => {
    it('deve salvar e retornar o kit', async () => {
      const kit = makeKit();
      kitRepository.save.mockResolvedValue(kit);

      const result = await service.salvarKit(kit);

      expect(kitRepository.save).toHaveBeenCalledWith(kit);
      expect(result).toBe(kit);
    });

    it('deve lançar ConflictException quando kit duplicado para o mesmo plano/mês/ano', async () => {
      kitRepository.save.mockRejectedValue({ driverError: { code: '23505' } });

      await expect(service.salvarKit(makeKit())).rejects.toThrow(ConflictException);
    });

    it('deve lançar InternalServerErrorException para outros erros', async () => {
      kitRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.salvarKit(makeKit())).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('atualizarItensKit', () => {
    it('deve excluir itens antigos e salvar os novos', async () => {
      const kit = makeKit();
      const novosItens = [
        Object.assign(new ItemKitMensal(), { nomeProduto: 'Caneca', quantidade: 1 }),
      ];
      itemKitRepository.delete.mockResolvedValue({ affected: 0 });
      kitRepository.save.mockResolvedValue({ ...kit, itens: novosItens });

      const result = await service.atualizarItensKit(kit, novosItens);

      expect(itemKitRepository.delete).toHaveBeenCalledWith({ idKit: kit.id });
      expect(kitRepository.save).toHaveBeenCalledWith(expect.objectContaining({ itens: novosItens }));
      expect(result).toBeDefined();
    });

    it('deve lançar InternalServerErrorException ao falhar na exclusão dos itens antigos', async () => {
      itemKitRepository.delete.mockRejectedValue(new Error('FK error'));

      await expect(service.atualizarItensKit(makeKit(), [])).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(kitRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException ao falhar ao salvar novos itens', async () => {
      itemKitRepository.delete.mockResolvedValue({ affected: 0 });
      kitRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.atualizarItensKit(makeKit(), [])).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('pesquisarKits', () => {
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
      kitRepository.createQueryBuilder.mockReturnValue(qb);
      return qb;
    };

    it('deve retornar resultado paginado sem filtros', async () => {
      const kit = makeKit();
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[kit], 1]);

      const result = await service.pesquisarKits({ pagina: 1, tamanhoPagina: 10 });

      expect(result.itens).toHaveLength(1);
      expect(result.totalItens).toBe(1);
      expect(result.totalPaginas).toBe(1);
    });

    it('deve aplicar filtro de idPlano', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarKits({ pagina: 1, tamanhoPagina: 10, idPlano: 2 });

      expect(qb.andWhere).toHaveBeenCalledWith('kit.idPlano = :idPlano', { idPlano: 2 });
    });

    it('deve aplicar filtro de mes e ano', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.pesquisarKits({ pagina: 1, tamanhoPagina: 10, mes: 4, ano: 2026 });

      expect(qb.andWhere).toHaveBeenCalledWith('kit.mesReferencia = :mes', { mes: 4 });
      expect(qb.andWhere).toHaveBeenCalledWith('kit.anoReferencia = :ano', { ano: 2026 });
    });

    it('deve calcular totalPaginas mínimo como 1', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.pesquisarKits({ pagina: 1, tamanhoPagina: 10 });

      expect(result.totalPaginas).toBe(1);
    });
  });

  describe('obterKitPorId', () => {
    it('deve retornar o kit quando encontrado', async () => {
      const kit = makeKit();
      kitRepository.findOne.mockResolvedValue(kit);

      const result = await service.obterKitPorId(1);

      expect(kitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['plano', 'itens'],
      });
      expect(result).toBe(kit);
    });

    it('deve retornar null quando não encontrado', async () => {
      kitRepository.findOne.mockResolvedValue(null);

      const result = await service.obterKitPorId(99);

      expect(result).toBeNull();
    });
  });

  describe('garantirKitPorId', () => {
    it('deve retornar o kit quando encontrado', async () => {
      const kit = makeKit();
      kitRepository.findOne.mockResolvedValue(kit);

      const result = await service.garantirKitPorId(1);

      expect(result).toBe(kit);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      kitRepository.findOne.mockResolvedValue(null);

      await expect(service.garantirKitPorId(99)).rejects.toThrow(
        new NotFoundException('Kit mensal com ID 99 não encontrado.'),
      );
    });
  });

  describe('obterKitPorPlanoMesAno', () => {
    it('deve retornar o kit quando encontrado', async () => {
      const kit = makeKit();
      kitRepository.findOne.mockResolvedValue(kit);

      const result = await service.obterKitPorPlanoMesAno(1, 4, 2026);

      expect(kitRepository.findOne).toHaveBeenCalledWith({
        where: { idPlano: 1, mesReferencia: 4, anoReferencia: 2026 },
        relations: ['itens'],
      });
      expect(result).toBe(kit);
    });

    it('deve retornar null quando não encontrado', async () => {
      kitRepository.findOne.mockResolvedValue(null);

      const result = await service.obterKitPorPlanoMesAno(99, 1, 2025);

      expect(result).toBeNull();
    });
  });

  describe('excluirKit', () => {
    it('deve excluir o kit com sucesso', async () => {
      kitRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.excluirKit(1)).resolves.toBeUndefined();
      expect(kitRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('deve lançar InternalServerErrorException ao falhar na exclusão', async () => {
      kitRepository.delete.mockRejectedValue(new Error('FK violation'));

      await expect(service.excluirKit(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
