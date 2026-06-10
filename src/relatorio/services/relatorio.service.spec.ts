import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RelatorioService } from '@relatorio/services';
import { TipoVenda } from '@venda/entities/venda.entity';
import { DateService } from '@common/services/date.service';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let dataSource: { query: jest.Mock };
  let dateServiceMock: {
    toUtcDateRange: jest.Mock;
    obterAnoMesAtualLocal: jest.Mock;
    obterIntervaloUtcMes: jest.Mock;
    obterDataAtualLocal: jest.Mock;
    subtrairDiasDataLocal: jest.Mock;
  };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };
    dateServiceMock = {
      toUtcDateRange: jest.fn((d: string) => ({
        start: `${d} 00:00:00.000`,
        end: `${d} 23:59:59.999`,
      })),
      obterAnoMesAtualLocal: jest.fn().mockReturnValue({
        ano: 2026,
        mes: 4,
      }),
      obterIntervaloUtcMes: jest.fn((ano: number, mes: number) => {
        const mesFormatado = String(mes).padStart(2, '0');
        const ultimoDia = String(
          new Date(Date.UTC(ano, mes, 0)).getUTCDate(),
        ).padStart(2, '0');

        return {
          start: `${ano}-${mesFormatado}-01 00:00:00.000`,
          end: `${ano}-${mesFormatado}-${ultimoDia} 23:59:59.999`,
        };
      }),
      obterDataAtualLocal: jest.fn().mockReturnValue('2026-04-28'),
      subtrairDiasDataLocal: jest
        .fn()
        .mockImplementation((data: string, dias: number) => {
          const dataUtc = new Date(`${data}T00:00:00.000Z`);
          dataUtc.setUTCDate(dataUtc.getUTCDate() - dias);

          return dataUtc.toISOString().slice(0, 10);
        }),
    };

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
        valorLiquido: '23100',
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
    const [consultaResumo] = dataSource.query.mock.calls[0] as [string];
    expect(consultaResumo).toContain('AND item.brinde = false');
    expect(result).toEqual({
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      quantidadeItens: 12,
      descontoTotal: 1500,
      valorTotal: 25000,
      valorLiquido: 23100,
    });
  });

  it('deve retornar o resumo mensal do dashboard', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        mes: '1',
        quantidadeItensVendidos: '14',
        valorVendas: '12000',
        valorDespesas: '4500',
        saldo: '7500',
      },
      {
        mes: '2',
        quantidadeItensVendidos: '22',
        valorVendas: '18000',
        valorDespesas: '5000',
        saldo: '13000',
      },
      {
        mes: '3',
        quantidadeItensVendidos: '0',
        valorVendas: '0',
        valorDespesas: '0',
        saldo: '0',
      },
    ]);

    const result = await service.obterResumoMensalDashboard({
      ano: 2026,
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.not.stringContaining('EXTRACT('),
      expect.arrayContaining([
        '2026-01-01 00:00:00.000',
        '2026-01-31 23:59:59.999',
        '2026-12-01 00:00:00.000',
        '2026-12-31 23:59:59.999',
      ]),
    );
    expect(result).toEqual({
      ano: 2026,
      totalQuantidadeItensVendidos: 36,
      totalVendas: 30000,
      totalDespesas: 9500,
      totalImpostos: 0,
      totalTaxas: 0,
      totalQuantidadeBrindes: 0,
      saldo: 20500,
      itens: [
        {
          mes: 1,
          quantidadeItensVendidos: 14,
          valorVendas: 12000,
          valorDespesas: 4500,
          saldo: 7500,
          quantidadeBrindes: 0,
          valorTaxas: 0,
          valorImpostos: 0,
        },
        {
          mes: 2,
          quantidadeItensVendidos: 22,
          valorVendas: 18000,
          valorDespesas: 5000,
          saldo: 13000,
          quantidadeBrindes: 0,
          valorTaxas: 0,
          valorImpostos: 0,
        },
        {
          mes: 3,
          quantidadeItensVendidos: 0,
          valorVendas: 0,
          valorDespesas: 0,
          saldo: 0,
          quantidadeBrindes: 0,
          valorTaxas: 0,
          valorImpostos: 0,
        },
      ],
    });
  });

  it('deve usar ano local atual no resumo mensal quando o filtro não informar ano', async () => {
    dateServiceMock.obterAnoMesAtualLocal.mockReturnValue({
      ano: 2025,
      mes: 12,
    });
    dataSource.query.mockResolvedValueOnce([]);

    const result = await service.obterResumoMensalDashboard({});

    expect(dateServiceMock.obterAnoMesAtualLocal).toHaveBeenCalled();
    expect(dateServiceMock.obterIntervaloUtcMes).toHaveBeenCalledWith(2025, 1);
    expect(dateServiceMock.obterIntervaloUtcMes).toHaveBeenCalledWith(2025, 12);
    expect(result.ano).toBe(2025);
  });

  it('deve retornar o top 5 produtos mais vendidos do mês atual para o dashboard', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        idProduto: '1',
        codigo: '3001',
        nomeProduto: 'CUBO INFINITO',
        categoriaId: '2',
        categoriaNome: 'IMPRESSAO 3D',
        quantidadeVendida: '18',
      },
    ]);

    const result = await service.obterTopProdutosMesDashboard();

    expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
      '2026-04-01 00:00:00.000',
      '2026-04-30 23:59:59.999',
    ]);
    expect(result).toEqual({
      ano: 2026,
      mes: 4,
      itens: [
        {
          idProduto: 1,
          codigo: 3001,
          nomeProduto: 'CUBO INFINITO',
          categoria: { id: 2, nome: 'IMPRESSAO 3D' },
          quantidadeVendida: 18,
        },
      ],
    });
  });

  it('deve retornar as despesas do mês por categoria para o dashboard', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        idCategoria: '1',
        nomeCategoria: 'Insumos',
        valorTotal: '12500',
      },
    ]);

    const result = await service.obterDespesasCategoriasMesDashboard();

    expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
      '2026-04-01 00:00:00.000',
      '2026-04-30 23:59:59.999',
    ]);
    expect(result).toEqual({
      ano: 2026,
      mes: 4,
      itens: [
        {
          idCategoria: 1,
          nomeCategoria: 'Insumos',
          valorTotal: 12500,
        },
      ],
    });
  });

  it('deve usar a data inicial como data final quando a data final não for informada', async () => {
    dataSource.query.mockResolvedValue([
      {
        quantidadeItens: 0,
        descontoTotal: 0,
        valorTotal: 0,
        valorLiquido: 0,
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

  it('deve retornar o relatório de produção do período informado', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          codigo: '3001',
          nome: 'Cubo Infinito',
          quantidadeProduzida: '12',
          valorUnitario: '2500',
          valorEstimado: '30000',
        },
      ])
      .mockResolvedValueOnce([
        {
          totalItens: '1',
          totalQuantidadeProduzida: '12',
          totalValorEstimado: '30000',
        },
      ]);

    const result = await service.obterRelatorioProducao({
      dataInicio: '2026-04-01',
      dataFim: '2026-04-06',
      pagina: 1,
      tamanhoPagina: 10,
      ordenarPor: 'quantidadeProduzida',
      direcao: 'desc',
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("mov.origem = 'PRODUCAO'"),
      ['2026-04-01 00:00:00.000', '2026-04-06 23:59:59.999', 10, 0],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('COUNT(*)::int AS "totalItens"'),
      ['2026-04-01 00:00:00.000', '2026-04-06 23:59:59.999'],
    );
    expect(result).toEqual({
      dataInicio: '2026-04-01',
      dataFim: '2026-04-06',
      diasNoPeriodo: 6,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalQuantidadeProduzida: 12,
      totalValorEstimado: 30000,
      mediaQuantidadePorDia: 2,
      mediaValorPorDia: 5000,
      itens: [
        {
          codigo: 3001,
          nome: 'Cubo Infinito',
          quantidadeProduzida: 12,
          valorUnitario: 2500,
          valorEstimado: 30000,
          mediaQuantidadePorDia: 2,
          mediaValorPorDia: 5000,
        },
      ],
    });
  });

  it('deve retornar a sugestão de produção baseada em vendas e estoque', async () => {
    dataSource.query
      .mockResolvedValueOnce([
        {
          idProduto: '1',
          codigo: '3001',
          nome: 'Cubo Infinito',
          idCategoria: '2',
          nomeCategoria: 'IMPRESSAO 3D',
          estoqueAtual: '8',
          estoqueMinimo: '10',
          quantidadeVendida: '84',
          mediaVendaDiaria: '3',
          demandaPlanejada: '21',
          estoqueSeguranca: '6',
          estoqueAlvo: '27',
          diasCobertura: '2.666666',
          sugestaoProducao: '19',
          prioridade: 'PRODUZIR',
        },
      ])
      .mockResolvedValueOnce([
        {
          totalItens: '1',
          totalQuantidadeSugerida: '19',
        },
      ]);

    const result = await service.obterSugestaoProducao({
      dataInicio: '2026-04-01',
      dataFim: '2026-04-28',
      pagina: 1,
      tamanhoPagina: 10,
      diasHistorico: 28,
      diasPlanejamento: 7,
      diasEstoqueSeguranca: 2,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WITH estoque AS'),
      ['2026-04-01 00:00:00.000', '2026-04-28 23:59:59.999', 28, 7, 2, 10, 0],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('totalQuantidadeSugerida'),
      ['2026-04-01 00:00:00.000', '2026-04-28 23:59:59.999', 28, 7, 2],
    );
    expect(result).toEqual({
      dataInicio: '2026-04-01',
      dataFim: '2026-04-28',
      diasHistorico: 28,
      diasPlanejamento: 7,
      diasEstoqueSeguranca: 2,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalQuantidadeSugerida: 19,
      itens: [
        {
          idProduto: 1,
          codigo: 3001,
          nome: 'Cubo Infinito',
          categoria: { id: 2, nome: 'IMPRESSAO 3D' },
          estoqueAtual: 8,
          estoqueMinimo: 10,
          quantidadeVendida: 84,
          mediaVendaDiaria: 3,
          demandaPlanejada: 21,
          estoqueSeguranca: 6,
          estoqueAlvo: 27,
          diasCobertura: 2.67,
          sugestaoProducao: 19,
          prioridade: 'PRODUZIR',
        },
      ],
    });
  });

  it('deve usar os últimos dias de histórico quando datas não forem informadas na sugestão de produção', async () => {
    dataSource.query.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        totalItens: '0',
        totalQuantidadeSugerida: '0',
      },
    ]);

    const result = await service.obterSugestaoProducao({
      pagina: 1,
      tamanhoPagina: 10,
      diasHistorico: 28,
      diasPlanejamento: 7,
      diasEstoqueSeguranca: 2,
    });

    expect(dateServiceMock.obterDataAtualLocal).toHaveBeenCalled();
    expect(dateServiceMock.subtrairDiasDataLocal).toHaveBeenCalledWith(
      '2026-04-28',
      27,
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(1, expect.any(String), [
      '2026-04-01 00:00:00.000',
      '2026-04-28 23:59:59.999',
      28,
      7,
      2,
      10,
      0,
    ]);
    expect(result.totalPaginas).toBe(1);
    expect(result.totalQuantidadeSugerida).toBe(0);
  });

  it('deve lançar erro quando a data final for menor que a data inicial na sugestão de produção', async () => {
    await expect(
      service.obterSugestaoProducao({
        dataInicio: '2026-04-10',
        dataFim: '2026-04-01',
        pagina: 1,
        tamanhoPagina: 10,
        diasHistorico: 28,
        diasPlanejamento: 7,
        diasEstoqueSeguranca: 2,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar erro quando a data final for menor que a data inicial no relatório de produção', async () => {
    await expect(
      service.obterRelatorioProducao({
        dataInicio: '2026-04-10',
        dataFim: '2026-04-01',
        pagina: 1,
        tamanhoPagina: 10,
      }),
    ).rejects.toThrow(BadRequestException);
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
          codigo: '3001',
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
          codigo: 3001,
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
          codigo: '3001',
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
          codigo: 3001,
          nome: 'Cubo Infinito',
          quantidade: 8,
          valor: 2500,
          valorTotal: 20000,
        },
      ],
    });
  });

  it('deve ordenar o relatório de valor dos produtos em estoque conforme filtro informado', async () => {
    dataSource.query.mockResolvedValueOnce([]).mockResolvedValueOnce([
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
