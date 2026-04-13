import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RelatorioService } from '@relatorio/services';
import { TipoVenda } from '@venda/entities/venda.entity';
import { DateService } from '../../common/services/date.service';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let dataSource: { query: jest.Mock };
  const dateServiceMock = {
    toUtcDateRange: (d: string) => ({
      start: `${d} 00:00:00.000`,
      end: `${d} 23:59:59.999`,
    }),
  };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatorioService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: DateService,
          useValue: dateServiceMock,
        },
      ],
    }).compile();

    service = module.get<RelatorioService>(RelatorioService);
  });

  it('deve retornar o resumo de vendas do período informado', async () => {
    dataSource.query.mockResolvedValue([
      {
        quantidadeItens: '12',
        descontoTotal: '1500',
        valorTotal: '25000',
      },
    ]);

    const result = await service.obterResumoVendasPorPeriodo({
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      tipoVenda: TipoVenda.FEIRA,
      idFeira: 1,
    });

    expect(dataSource.query).toHaveBeenCalledTimes(1);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('venda.id_feira = $4'),
      [
        '2026-03-31 00:00:00.000',
        '2026-03-31 23:59:59.999',
        TipoVenda.FEIRA,
        1,
      ],
    );
    expect(result).toEqual({
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      quantidadeItens: 12,
      descontoTotal: 1500,
      valorTotal: 25000,
    });
  });

  it('deve usar a data inicial como data final quando a data final não for informada', async () => {
    dataSource.query.mockResolvedValue([
      {
        quantidadeItens: 0,
        descontoTotal: 0,
        valorTotal: 0,
      },
    ]);

    await service.obterResumoVendasPorPeriodo({
      dataInicio: '2026-03-31',
    });

    expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
      '2026-03-31 00:00:00.000',
      '2026-03-31 23:59:59.999',
    ]);
  });

  it('deve lançar erro quando a data final for menor que a data inicial', async () => {
    await expect(
      service.obterResumoVendasPorPeriodo({
        dataInicio: '2026-03-31',
        dataFim: '2026-03-30',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar erro ao filtrar feira no resumo sem tipo FEIRA', async () => {
    await expect(
      service.obterResumoVendasPorPeriodo({
        dataInicio: '2026-03-31',
        dataFim: '2026-03-31',
        idFeira: 1,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve retornar os produtos mais vendidos com os filtros informados', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          idProduto: '1',
          codigo: 'CB-001',
          nomeProduto: 'CUBO INFINITO',
          categoriaId: '2',
          categoriaNome: 'IMPRESSAO 3D',
          quantidadeVendida: '12',
        },
      ])
      .mockResolvedValueOnce([{ totalItens: 1 }]);

    const result = await service.obterProdutosMaisVendidosPorPeriodo({
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      tipoVenda: TipoVenda.FEIRA,
      idFeira: 1,
      idsCategorias: [2],
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(dataSource.query).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      itens: [
        {
          idProduto: 1,
          codigo: 'CB-001',
          nomeProduto: 'CUBO INFINITO',
          categoria: {
            id: 2,
            nome: 'IMPRESSAO 3D',
          },
          quantidadeVendida: 12,
        },
      ],
    });
  });

  it('deve lançar erro ao filtrar feira sem tipo FEIRA', async () => {
    await expect(
      service.obterProdutosMaisVendidosPorPeriodo({
        dataInicio: '2026-03-31',
        dataFim: '2026-03-31',
        idFeira: 1,
        pagina: 1,
        tamanhoPagina: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar erro quando dataFim for menor que dataInicio em produtos mais vendidos', async () => {
    await expect(
      service.obterProdutosMaisVendidosPorPeriodo({
        dataInicio: '2026-03-31',
        dataFim: '2026-03-30',
        pagina: 1,
        tamanhoPagina: 10,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      ),
    );
  });

  it('deve retornar produto com idProduto e categoria nulos', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          idProduto: null,
          codigo: null,
          nomeProduto: 'ITEM AVULSO',
          categoriaId: null,
          categoriaNome: null,
          quantidadeVendida: '3',
        },
      ])
      .mockResolvedValueOnce([{ totalItens: 1 }]);

    const result = await service.obterProdutosMaisVendidosPorPeriodo({
      dataInicio: '2026-03-31',
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.itens[0]?.idProduto).toBeNull();
    expect(result.itens[0]?.categoria).toBeNull();
  });

  it('deve usar dataInicio como dataFim em produtos mais vendidos quando não informado', async () => {
    dataSource.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ totalItens: 0 }]);

    await service.obterProdutosMaisVendidosPorPeriodo({
      dataInicio: '2026-03-31',
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([
        '2026-03-31 00:00:00.000',
        '2026-03-31 23:59:59.999',
      ]),
    );
  });

  it('deve retornar totalPaginas mínimo 1 quando não há produtos', async () => {
    dataSource.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ totalItens: 0 }]);

    const result = await service.obterProdutosMaisVendidosPorPeriodo({
      dataInicio: '2026-03-31',
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.totalPaginas).toBe(1);
  });

  it('deve retornar o relatório de valor dos produtos em estoque', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          codigo: 'CB-001',
          nome: 'Cubo Infinito',
          quantidade: '8',
          valor: '2500',
          valorTotal: '20000',
        },
      ])
      .mockResolvedValueOnce([
        {
          totalItens: '1',
          totalQuantidade: '8',
          totalValor: '2500',
          totalValorTotal: '20000',
        },
      ]);

    const result = await service.obterValorProdutosEstoque({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(dataSource.query).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalQuantidade: 8,
      totalValor: 2500,
      totalValorTotal: 20000,
      itens: [
        {
          codigo: 'CB-001',
          nome: 'Cubo Infinito',
          quantidade: 8,
          valor: 2500,
          valorTotal: 20000,
        },
      ],
    });
  });

  it('deve ordenar o relatório de valor dos produtos em estoque conforme filtro informado', async () => {
    dataSource.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          totalItens: '0',
          totalQuantidade: '0',
          totalValor: '0',
          totalValorTotal: '0',
        },
      ]);

    await service.obterValorProdutosEstoque({
      pagina: 1,
      tamanhoPagina: 10,
      ordenarPor: 'valorTotal',
      direcao: 'desc',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        'ORDER BY COALESCE(e.quantidade_estoque, 0) * p.valor DESC, p.codigo ASC',
      ),
      [10, 0],
    );
  });

  it('deve retornar totalizadores zerados quando não houver produtos em estoque', async () => {
    dataSource.query.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        totalItens: '0',
        totalQuantidade: null,
        totalValor: null,
        totalValorTotal: null,
      },
    ]);

    const result = await service.obterValorProdutosEstoque({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(result.totalPaginas).toBe(1);
    expect(result.totalQuantidade).toBe(0);
    expect(result.totalValor).toBe(0);
    expect(result.totalValorTotal).toBe(0);
    expect(result.itens).toEqual([]);
  });

  it('deve retornar zeros quando campos de resumo forem nulos', async () => {
    dataSource.query.mockResolvedValue([
      { quantidadeItens: null, descontoTotal: null, valorTotal: null },
    ]);

    const result = await service.obterResumoVendasPorPeriodo({
      dataInicio: '2026-03-31',
    });

    expect(result.quantidadeItens).toBe(0);
    expect(result.descontoTotal).toBe(0);
    expect(result.valorTotal).toBe(0);
  });
});
