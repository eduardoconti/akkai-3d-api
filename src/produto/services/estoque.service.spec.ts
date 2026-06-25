import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@auth/entities/user.entity';
import { DateService } from '@common/services/date.service';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { EstoqueService, ProdutoService } from '@produto/services';

describe('EstoqueService', () => {
  let service: EstoqueService;
  let movimentacaoRepository: {
    save: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let garantirExisteProdutoMock: jest.Mock;
  let toUtcDateRangeMock: jest.Mock;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn(),
      andWhere: jest.fn(),
      orderBy: jest.fn(),
      addOrderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn(),
    };
    Object.values(queryBuilder).forEach((mock) => {
      mock.mockReturnValue(queryBuilder);
    });
    movimentacaoRepository = {
      save: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    garantirExisteProdutoMock = jest.fn();
    toUtcDateRangeMock = jest.fn((data: string) => ({
      start: `${data}T03:00:00.000Z`,
      end: `${data}T02:59:59.999Z`,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstoqueService,
        {
          provide: getRepositoryToken(MovimentacaoEstoque),
          useValue: movimentacaoRepository,
        },
        {
          provide: ProdutoService,
          useValue: { garantirExisteProduto: garantirExisteProdutoMock },
        },
        {
          provide: DateService,
          useValue: { toUtcDateRange: toUtcDateRangeMock },
        },
      ],
    }).compile();

    service = module.get<EstoqueService>(EstoqueService);
  });

  it('deve registrar entrada de estoque', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 1 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.entradaEstoque(1, 5, OrigemMovimentacaoEstoque.COMPRA, 7);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 5,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.COMPRA,
        idUsuarioInclusao: 7,
      }),
    );
  });

  it('deve registrar entrada de estoque por producao', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 2 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.entradaEstoque(2, 3, OrigemMovimentacaoEstoque.PRODUCAO, 8);

    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.PRODUCAO,
        idUsuarioInclusao: 8,
      }),
    );
  });

  it('deve registrar saída de estoque', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 1 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.saidaEstoque(1, 2, OrigemMovimentacaoEstoque.AJUSTE, 9);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.AJUSTE,
        idUsuarioInclusao: 9,
      }),
    );
  });

  it('deve registrar saída de estoque por perda', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 3 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.saidaEstoque(3, 1, OrigemMovimentacaoEstoque.PERDA, 10);

    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.PERDA,
        idUsuarioInclusao: 10,
      }),
    );
  });

  it('deve listar movimentações por produto ordenadas por data decrescente', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 3 }),
    );
    movimentacaoRepository.findAndCount.mockResolvedValue([
      [
        Object.assign(new MovimentacaoEstoque(), {
          id: 11,
          idProduto: 3,
          idItemVenda: 21,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
          itemVenda: {
            id: 21,
            idVenda: 101,
            brinde: true,
          },
          usuarioInclusao: Object.assign(new User(), {
            id: 7,
            name: 'Eduardo',
          }),
        }),
      ],
      1,
    ]);

    const result = await service.listarMovimentacoesPorProduto(3, {
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(3);
    expect(movimentacaoRepository.findAndCount).toHaveBeenCalledWith({
      where: { idProduto: 3 },
      relations: { itemVenda: true, usuarioInclusao: true },
      order: { dataInclusao: 'DESC', id: 'DESC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      itens: [
        {
          id: 11,
          idProduto: 3,
          idItemVenda: 21,
          idVenda: 101,
          brinde: true,
          usuario: 'Eduardo',
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
        },
      ],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });
  it('deve usar "-" quando a movimentação não tiver usuário vinculado', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 4 }),
    );
    movimentacaoRepository.findAndCount.mockResolvedValue([
      [
        Object.assign(new MovimentacaoEstoque(), {
          id: 12,
          idProduto: 4,
          quantidade: 1,
          tipo: TipoMovimentacaoEstoque.ENTRADA,
          origem: OrigemMovimentacaoEstoque.AJUSTE,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
          usuarioInclusao: undefined,
        }),
      ],
      1,
    ]);

    const result = await service.listarMovimentacoesPorProduto(4, {
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.itens[0]?.usuario).toBe('-');
  });

  it('deve listar movimentações com filtros gerais', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 4 }),
    );
    const movimentacao = Object.assign(new MovimentacaoEstoque(), {
      id: 12,
      idProduto: 4,
      quantidade: 1,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.PRODUCAO,
      dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
      produto: Object.assign(new Produto(), {
        id: 4,
        codigo: 4001,
        nome: 'Cubo Infinito',
      }),
      usuarioInclusao: Object.assign(new User(), {
        id: 7,
        name: 'Eduardo',
      }),
    });
    queryBuilder.getManyAndCount.mockResolvedValue([[movimentacao], 1]);

    const result = await service.listarMovimentacoes({
      pagina: 2,
      tamanhoPagina: 10,
      dataInicio: '2026-04-01',
      dataFim: '2026-04-10',
      tipos: [TipoMovimentacaoEstoque.ENTRADA],
      origens: [OrigemMovimentacaoEstoque.PRODUCAO],
      idProduto: 4,
    });

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(4);
    expect(movimentacaoRepository.createQueryBuilder).toHaveBeenCalledWith(
      'movimentacao',
    );
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'movimentacao.produto',
      'produto',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'movimentacao.dataInclusao >= :dataInicio',
      { dataInicio: '2026-04-01T03:00:00.000Z' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'movimentacao.dataInclusao <= :dataFim',
      { dataFim: '2026-04-10T02:59:59.999Z' },
    );
    expect(toUtcDateRangeMock).toHaveBeenCalledWith('2026-04-01');
    expect(toUtcDateRangeMock).toHaveBeenCalledWith('2026-04-10');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'movimentacao.tipo IN (:...tipos)',
      { tipos: [TipoMovimentacaoEstoque.ENTRADA] },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'movimentacao.origem IN (:...origens)',
      { origens: [OrigemMovimentacaoEstoque.PRODUCAO] },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'movimentacao.idProduto = :idProduto',
      { idProduto: 4 },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'movimentacao.dataInclusao',
      'DESC',
    );
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
      'movimentacao.id',
      'DESC',
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      itens: [
        {
          id: 12,
          idProduto: 4,
          idItemVenda: undefined,
          idVenda: undefined,
          brinde: undefined,
          usuario: 'Eduardo',
          quantidade: 1,
          tipo: TipoMovimentacaoEstoque.ENTRADA,
          origem: OrigemMovimentacaoEstoque.PRODUCAO,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
          produto: {
            id: 4,
            codigo: 4001,
            nome: 'Cubo Infinito',
          },
        },
      ],
      pagina: 2,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });
});
