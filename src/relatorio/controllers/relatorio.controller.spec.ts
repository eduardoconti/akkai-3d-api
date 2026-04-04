import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioController } from '@relatorio/controllers';
import { RelatorioService } from '@relatorio/services';
import { TipoVenda } from '@venda/entities/venda.entity';

describe('RelatorioController', () => {
  let controller: RelatorioController;
  let relatorioService: {
    obterResumoVendasPorPeriodo: jest.Mock;
    obterProdutosMaisVendidosPorPeriodo: jest.Mock;
  };

  beforeEach(async () => {
    relatorioService = {
      obterResumoVendasPorPeriodo: jest.fn(),
      obterProdutosMaisVendidosPorPeriodo: jest.fn(),
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
});
