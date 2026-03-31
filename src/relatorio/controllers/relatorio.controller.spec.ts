import { Test, TestingModule } from '@nestjs/testing';
import { RelatorioController } from '@relatorio/controllers';
import { RelatorioService } from '@relatorio/services';

describe('RelatorioController', () => {
  let controller: RelatorioController;
  let relatorioService: {
    obterResumoVendasPorPeriodo: jest.Mock;
  };

  beforeEach(async () => {
    relatorioService = {
      obterResumoVendasPorPeriodo: jest.fn(),
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
});
