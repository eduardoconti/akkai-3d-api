import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RelatorioService } from '@relatorio/services';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatorioService,
        {
          provide: DataSource,
          useValue: dataSource,
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
    });

    expect(dataSource.query).toHaveBeenCalledTimes(1);
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
});
