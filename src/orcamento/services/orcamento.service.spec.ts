import { InternalServerErrorException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Orcamento, StatusOrcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('OrcamentoService', () => {
  let service: OrcamentoService;
  let repository: {
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrcamentoService,
        {
          provide: getRepositoryToken(Orcamento),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrcamentoService>(OrcamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve inserir orçamento', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      nomeCliente: 'Eduardo',
    });
    repository.save.mockResolvedValue(orcamento);

    const result = await service.inserirOrcamento(orcamento);

    expect(repository.save).toHaveBeenCalledWith(orcamento);
    expect(result).toBe(orcamento);
  });

  it('deve lançar erro ao falhar inserção de orçamento', async () => {
    repository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirOrcamento(new Orcamento())).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir orçamento'),
    );
  });

  it('deve listar orçamentos paginados', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([[Object.assign(new Orcamento(), { id: 1 })], 1]),
    };
    repository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.listarOrcamentos({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('orcamento');
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
      'orcamento.feira',
      'feira',
    );
    expect(qb.orderBy).toHaveBeenCalledWith('orcamento.dataInclusao', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('orcamento.id', 'DESC');
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.getManyAndCount).toHaveBeenCalled();
    expect(result).toEqual({
      itens: [expect.objectContaining({ id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('deve aplicar filtro de status ao listar orçamentos paginados', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    repository.createQueryBuilder.mockReturnValue(qb);

    await service.listarOrcamentos({
      pagina: 1,
      tamanhoPagina: 10,
      status: [StatusOrcamento.PENDENTE, StatusOrcamento.APROVADO],
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      'orcamento.status IN (:...status)',
      {
        status: [StatusOrcamento.PENDENTE, StatusOrcamento.APROVADO],
      },
    );
  });

  it('deve lançar erro ao falhar exclusão de orçamento', async () => {
    repository.delete = jest.fn().mockRejectedValue(new Error('falha'));

    await expect(service.excluirOrcamento(1)).rejects.toThrow(
      new InternalServerErrorException('Erro ao excluir orçamento'),
    );
  });

  it('deve excluir orçamento', async () => {
    repository.delete = jest.fn().mockResolvedValue(undefined);

    await service.excluirOrcamento(1);

    expect(repository.delete).toHaveBeenCalledWith({ id: 1 });
  });
});
