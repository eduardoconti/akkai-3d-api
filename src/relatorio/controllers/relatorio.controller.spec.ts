import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioController } from '@relatorio/controllers';
import { RelatorioService } from '@relatorio/services';
import { TipoVenda } from '@venda/entities/venda.entity';

describe('RelatorioController', () => {
  let controller: RelatorioController;
  let relatorioService: {
    obterResumoMensalDashboard: jest.Mock;
    obterTopProdutosMesDashboard: jest.Mock;
    obterDespesasCategoriasMesDashboard: jest.Mock;
    obterResumoVendasPorPeriodo: jest.Mock;
    obterProdutosMaisVendidosPorPeriodo: jest.Mock;
    obterValorProdutosEstoque: jest.Mock;
    obterSugestaoProducao: jest.Mock;
    obterRelatorioProducao: jest.Mock;
  };

  beforeEach(async () => {
    relatorioService = {
      obterResumoMensalDashboard: jest.fn(),
      obterTopProdutosMesDashboard: jest.fn(),
      obterDespesasCategoriasMesDashboard: jest.fn(),
      obterResumoVendasPorPeriodo: jest.fn(),
      obterProdutosMaisVendidosPorPeriodo: jest.fn(),
      obterValorProdutosEstoque: jest.fn(),
      obterSugestaoProducao: jest.fn(),
      obterRelatorioProducao: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelatorioController],
      providers: [
        {
          provide: RelatorioService,
          useValue: relatorioService,
        },
      ],
    }).compile();

    controller = module.get<RelatorioController>(RelatorioController);
  });

  it('deve delegar a obtenção do resumo mensal do dashboard', async () => {
    const filtro = { ano: 2026 };
    const resumo = {
      ano: 2026,
      totalQuantidadeItensVendidos: 14,
      totalQuantidadeItensCatalogo: 10,
      totalQuantidadeBrindes: 2,
      totalQuantidadeItensAvulsos: 2,
      totalVendas: 150000,
      totalDespesas: 47000,
      totalTaxas: 9000,
      totalAjusteCarteira: 4000,
      saldo: 103000,
      itens: [
        {
          mes: 1,
          quantidadeItensVendidos: 14,
          quantidadeItensCatalogo: 10,
          quantidadeBrindes: 2,
          quantidadeItensAvulsos: 2,
          valorVendas: 12000,
          valorTaxas: 700,
          valorDespesas: 4500,
          valorAjusteCarteira: 1000,
          saldo: 7800,
        },
      ],
    };
    relatorioService.obterResumoMensalDashboard.mockResolvedValue(resumo);

    const result = await controller.obterResumoMensalDashboard(filtro);

    expect(relatorioService.obterResumoMensalDashboard).toHaveBeenCalledWith(
      filtro,
    );
    expect(result).toEqual(resumo);
  });

  it('deve delegar a obtenção do top 5 produtos do mês no dashboard', async () => {
    const response = {
      ano: 2026,
      mes: 4,
      itens: [
        {
          idProduto: 1,
          codigo: 3001,
          nomeProduto: 'Cubo Infinito',
          categoria: { id: 2, nome: 'IMPRESSAO 3D' },
          quantidadeVendida: 18,
        },
      ],
    };
    relatorioService.obterTopProdutosMesDashboard.mockResolvedValue(response);

    const result = await controller.obterTopProdutosMesDashboard();

    expect(relatorioService.obterTopProdutosMesDashboard).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('deve delegar a obtenção das despesas do mês por categoria no dashboard', async () => {
    const response = {
      ano: 2026,
      mes: 4,
      valorTotal: 12500,
      itens: [
        {
          idCategoria: 1,
          nomeCategoria: 'Insumos',
          valorTotal: 12500,
        },
      ],
    };
    relatorioService.obterDespesasCategoriasMesDashboard.mockResolvedValue(
      response,
    );

    const result = await controller.obterDespesasCategoriasMesDashboard();

    expect(
      relatorioService.obterDespesasCategoriasMesDashboard,
    ).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('deve delegar a obtenção do resumo de vendas por período', async () => {
    const filtro = {
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      tipoVenda: TipoVenda.FEIRA,
      idFeira: 1,
    };
    const resumo = {
      dataInicio: '2026-03-31T00:00:00.000Z',
      dataFim: '2026-03-31T23:59:59.999Z',
      quantidadeItens: 8,
      descontoTotal: 500,
      valorTotal: 12500,
      valorLiquido: 11750,
    };
    relatorioService.obterResumoVendasPorPeriodo.mockResolvedValue(resumo);

    const result = await controller.obterResumoVendasPorPeriodo(filtro);

    expect(relatorioService.obterResumoVendasPorPeriodo).toHaveBeenCalledWith(
      filtro,
    );
    expect(result).toEqual(resumo);
  });

  it('deve delegar a obtenção dos produtos mais vendidos por período', async () => {
    const filtro = {
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      tipoVenda: TipoVenda.FEIRA,
      idFeira: 1,
      idsCategorias: [1, 2],
      pagina: 1,
      tamanhoPagina: 10,
    };
    const response = {
      dataInicio: '2026-03-31',
      dataFim: '2026-03-31',
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 0,
      totalPaginas: 1,
      itens: [],
    };
    relatorioService.obterProdutosMaisVendidosPorPeriodo.mockResolvedValue(
      response,
    );

    const result = await controller.obterProdutosMaisVendidosPorPeriodo(filtro);

    expect(
      relatorioService.obterProdutosMaisVendidosPorPeriodo,
    ).toHaveBeenCalledWith(filtro);
    expect(result).toEqual(response);
  });

  it('deve delegar a obtenção do valor dos produtos em estoque', async () => {
    const filtro = {
      pagina: 1,
      tamanhoPagina: 10,
    };
    const response = {
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
    };
    relatorioService.obterValorProdutosEstoque.mockResolvedValue(response);

    const result = await controller.obterValorProdutosEstoque(filtro);

    expect(relatorioService.obterValorProdutosEstoque).toHaveBeenCalledWith(
      filtro,
    );
    expect(result).toEqual(response);
  });

  it('deve delegar a obtenção do relatório de produção', async () => {
    const filtro = {
      dataInicio: '2026-04-01',
      dataFim: '2026-04-30',
      pagina: 1,
      tamanhoPagina: 10,
    };
    const response = {
      dataInicio: '2026-04-01',
      dataFim: '2026-04-30',
      diasNoPeriodo: 30,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalQuantidadeProduzida: 12,
      totalValorEstimado: 24000,
      mediaQuantidadePorDia: 0.4,
      mediaValorPorDia: 800,
      itens: [],
    };
    relatorioService.obterRelatorioProducao.mockResolvedValue(response);

    const result = await controller.obterRelatorioProducao(filtro);

    expect(relatorioService.obterRelatorioProducao).toHaveBeenCalledWith(
      filtro,
    );
    expect(result).toEqual(response);
  });

  it('deve delegar a obtenção da sugestão de produção', async () => {
    const filtro = {
      pagina: 1,
      tamanhoPagina: 10,
      feirasHistorico: 8,
      feirasPlanejamento: 2,
      feirasEstoqueSeguranca: 1,
    };
    const response = {
      dataInicio: '2026-04-04',
      dataFim: '2026-04-26',
      feirasHistorico: 8,
      feirasConsideradas: 8,
      feirasPlanejamento: 2,
      feirasEstoqueSeguranca: 1,
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
      totalQuantidadeSugerida: 24,
      itens: [
        {
          idProduto: 1,
          codigo: 3001,
          nome: 'Cubo Infinito',
          categoria: { id: 2, nome: 'IMPRESSAO 3D' },
          estoqueAtual: 8,
          estoqueMinimo: 10,
          quantidadeVendida: 84,
          mediaVendaPorFeira: 10.5,
          demandaPlanejada: 21,
          estoqueSeguranca: 10.5,
          estoqueAlvo: 31.5,
          feirasCobertura: 0.76,
          sugestaoProducao: 24,
          prioridade: 'CRITICO',
        },
      ],
    };
    relatorioService.obterSugestaoProducao.mockResolvedValue(response);

    const result = await controller.obterSugestaoProducao(filtro);

    expect(relatorioService.obterSugestaoProducao).toHaveBeenCalledWith(filtro);
    expect(result).toEqual(response);
  });
});
