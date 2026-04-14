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
  };

  beforeEach(async () => {
    relatorioService = {
      obterResumoMensalDashboard: jest.fn(),
      obterTopProdutosMesDashboard: jest.fn(),
      obterDespesasCategoriasMesDashboard: jest.fn(),
      obterResumoVendasPorPeriodo: jest.fn(),
      obterProdutosMaisVendidosPorPeriodo: jest.fn(),
      obterValorProdutosEstoque: jest.fn(),
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
      totalVendas: 150000,
      totalDespesas: 47000,
      saldo: 103000,
      itens: [
        {
          mes: 1,
          quantidadeItensVendidos: 14,
          valorVendas: 12000,
          valorDespesas: 4500,
          saldo: 7500,
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
          codigo: 'CB-001',
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
          codigo: 'CB-001',
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
});
