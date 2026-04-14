import { Carteira } from '@financeiro/entities';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities';
import { ItemVenda, TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from '@common/services/date.service';

describe('VendaService', () => {
  let service: VendaService;

  let carteiraRepository: {
    exists: jest.Mock;
  };
  let vendaRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
  };
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    manager: { save: jest.Mock; delete: jest.Mock };
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };
  let dataSource: {
    createQueryRunner: jest.Mock;
  };
  const dateServiceMock = {
    toUtcDateRange: (d: string) => ({
      start: `${d} 00:00:00.000`,
      end: `${d} 23:59:59.999`,
    }),
  };

  beforeEach(async () => {
    carteiraRepository = {
      exists: jest.fn(),
    };
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        valorTotal: '5000',
        descontoTotal: '200',
        valorLiquido: '4600',
      }),
      getMany: jest
        .fn()
        .mockResolvedValue([Object.assign(new Venda(), { id: 1 })]),
      getCount: jest.fn().mockResolvedValue(1),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
    vendaRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: { save: jest.fn(), delete: jest.fn() },
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
          provide: getRepositoryToken(Carteira),
          useValue: carteiraRepository,
        },
        {
          provide: getRepositoryToken(Venda),
          useValue: vendaRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
        {
          provide: DateService,
          useValue: dateServiceMock,
        },
      ],
    }).compile();

    service = module.get<VendaService>(VendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve verificar existência de carteira', async () => {
    carteiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeCarteira(7);

    expect(carteiraRepository.exists).toHaveBeenCalledWith({
      where: { id: 7, ativa: true },
    });
    expect(result).toBe(true);
  });

  it('deve inserir venda dentro de transação vinculando movimentos aos itens', async () => {
    const item = Object.assign(new ItemVenda(), { id: 9, idProduto: 1 });
    const venda = Object.assign(new Venda(), { id: 1, itens: [item] });
    const movimentacao = Object.assign(new MovimentacaoEstoque(), {
      idProduto: 1,
      quantidade: 2,
    });
    const movimentacoes = [movimentacao];
    queryRunner.manager.save
      .mockResolvedValueOnce(venda)
      .mockResolvedValueOnce(movimentacoes);

    const result = await service.inserirVenda(venda, movimentacoes);

    expect(queryRunner.manager.save).toHaveBeenNthCalledWith(1, venda);
    expect(movimentacoes[0]?.idItemVenda).toBe(9);
    expect(queryRunner.manager.save).toHaveBeenNthCalledWith(2, movimentacoes);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(result).toBe(venda);
  });

  it('deve alterar venda dentro de transação vinculando novos movimentos aos itens', async () => {
    const item = Object.assign(new ItemVenda(), { id: 12, idProduto: 1 });
    const venda = Object.assign(new Venda(), { id: 1, itens: [item] });
    vendaRepository.findOne.mockResolvedValue(venda);
    queryRunner.manager.save
      .mockResolvedValueOnce(venda)
      .mockResolvedValueOnce([{ idProduto: 1 }]);

    const movimentacao = Object.assign(new MovimentacaoEstoque(), {
      idProduto: 1,
    });

    const result = await service.alterarVenda(venda, [movimentacao]);

    expect(queryRunner.manager.delete).toHaveBeenNthCalledWith(1, ItemVenda, {
      idVenda: 1,
    });
    expect(queryRunner.manager.save).toHaveBeenNthCalledWith(1, venda);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(queryRunner.manager.save.mock.calls[1]?.[0][0]?.idItemVenda).toBe(
      12,
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(result).toBe(venda);
  });

  it('deve excluir venda dentro de transação sem criar movimentos de ajuste', async () => {
    const venda = Object.assign(new Venda(), { id: 1 });

    await service.excluirVenda(venda);

    expect(queryRunner.manager.delete).toHaveBeenNthCalledWith(1, ItemVenda, {
      idVenda: 1,
    });
    expect(queryRunner.manager.delete).toHaveBeenNthCalledWith(2, Venda, {
      id: 1,
    });
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('deve garantir existência de venda retornando a venda', async () => {
    vendaRepository.findOne.mockResolvedValue(
      Object.assign(new Venda(), { id: 3 }),
    );

    const result = await service.garantirExisteVenda(3);

    expect(result).toEqual(expect.objectContaining({ id: 3 }));
  });

  it('deve lançar NotFoundException quando venda não existir em garantirExisteVenda', async () => {
    vendaRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirExisteVenda(99)).rejects.toThrow(
      'Venda com ID 99 não encontrada.',
    );
  });

  it('deve obter venda por id com relações', async () => {
    vendaRepository.findOne.mockResolvedValue(
      Object.assign(new Venda(), { id: 3 }),
    );

    const result = await service.obterVendaPorId(3);

    expect(vendaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 3 },
      relations: {
        itens: { produto: true },
        feira: true,
        carteira: true,
      },
    });
    expect(result).toEqual(expect.objectContaining({ id: 3 }));
  });

  it('deve inserir venda com item de catálogo sem movimentação correspondente sem vincular idItemVenda', async () => {
    const item = Object.assign(new ItemVenda(), { id: 7, idProduto: 1 });
    const venda = Object.assign(new Venda(), { id: 1, itens: [item] });
    queryRunner.manager.save
      .mockResolvedValueOnce(venda)
      .mockResolvedValueOnce([]);

    // movimentacoes vazia: nenhuma correspondência para o item de catálogo
    await service.inserirVenda(venda, []);

    expect(queryRunner.commitTransaction).toHaveBeenCalled();
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

  it('deve fazer rollback ao falhar alteração da venda', async () => {
    const venda = Object.assign(new Venda(), { id: 1 });
    queryRunner.manager.delete.mockRejectedValueOnce(new Error('falha'));

    await expect(service.alterarVenda(venda, [])).rejects.toThrow(
      new InternalServerErrorException('Erro ao alterar venda'),
    );

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('deve fazer rollback ao falhar exclusão da venda', async () => {
    const venda = Object.assign(new Venda(), { id: 1 });
    queryRunner.manager.delete.mockRejectedValueOnce(new Error('falha'));

    await expect(service.excluirVenda(venda)).rejects.toThrow(
      new InternalServerErrorException('Erro ao excluir venda'),
    );

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('deve listar vendas paginadas', async () => {
    const result = await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(vendaRepository.createQueryBuilder).toHaveBeenCalledWith('venda');
    expect(result).toEqual({
      itens: [expect.objectContaining({ id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalizadores: {
        valorTotal: 5000,
        descontoTotal: 200,
        valorLiquido: 4600,
      },
    });
  });

  it('deve listar vendas filtradas por tipo', async () => {
    await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
      tipo: TipoVenda.FEIRA,
    });

    const queryBuilder = vendaRepository.createQueryBuilder.mock.results[0]
      ?.value as {
      andWhere: jest.Mock;
    };
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.tipo = :tipo',
      expect.objectContaining({ tipo: TipoVenda.FEIRA }),
    );
  });

  it('deve listar vendas filtradas por período, feira, carteira e pagamento', async () => {
    await service.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
      dataInicio: '2026-04-04',
      dataFim: '2026-04-05',
      tipo: TipoVenda.FEIRA,
      idFeira: 7,
      idCarteira: 2,
      meioPagamento: MeioPagamento.PIX,
    });

    const queryBuilder = vendaRepository.createQueryBuilder.mock.results[0]
      ?.value as {
      andWhere: jest.Mock;
    };

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.dataInclusao BETWEEN :dataInicio AND :dataFim',
      expect.objectContaining({
        dataInicio: '2026-04-04 00:00:00.000',
        dataFim: '2026-04-05 23:59:59.999',
      }),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.idFeira = :idFeira',
      expect.objectContaining({ idFeira: 7 }),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.idCarteira = :idCarteira',
      expect.objectContaining({ idCarteira: 2 }),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'venda.meioPagamento = :meioPagamento',
      expect.objectContaining({ meioPagamento: MeioPagamento.PIX }),
    );
  });

  it('deve lançar erro quando a data final for menor que a inicial', async () => {
    await expect(
      service.listarVendas({
        pagina: 1,
        tamanhoPagina: 10,
        dataInicio: '2026-04-05',
        dataFim: '2026-04-04',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      ),
    );
  });

  it('deve lançar erro quando filtrar por feira sem tipo FEIRA', async () => {
    await expect(
      service.listarVendas({
        pagina: 1,
        tamanhoPagina: 10,
        tipo: TipoVenda.LOJA,
        idFeira: 7,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'O filtro por feira só pode ser utilizado quando o tipo de venda for FEIRA.',
      ),
    );
  });

  it('deve retornar totalPaginas mínimo 1 quando não há vendas', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        valorTotal: '0',
        descontoTotal: '0',
        valorLiquido: '0',
      }),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };
    queryBuilder.clone.mockImplementation(() => queryBuilder);
    vendaRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.listarVendas({ pagina: 1, tamanhoPagina: 10 });

    expect(result.totalPaginas).toBe(1);
  });
});
