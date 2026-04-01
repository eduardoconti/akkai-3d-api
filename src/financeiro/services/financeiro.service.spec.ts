import { InternalServerErrorException } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Carteira, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

describe('FinanceiroService', () => {
  let service: FinanceiroService;
  let carteiraRepository: { save: jest.Mock; exists: jest.Mock };
  let despesaRepository: { save: jest.Mock; createQueryBuilder?: jest.Mock };
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    carteiraRepository = {
      save: jest.fn(),
      exists: jest.fn(),
    };
    despesaRepository = {
      save: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceiroService,
        {
          provide: getRepositoryToken(Carteira),
          useValue: carteiraRepository,
        },
        {
          provide: getRepositoryToken(Despesa),
          useValue: despesaRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<FinanceiroService>(FinanceiroService);
  });

  it('deve inserir carteira com sucesso', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      nome: 'CAIXA',
    });
    carteiraRepository.save.mockResolvedValue(carteira);

    const result = await service.inserirCarteira(carteira);

    expect(result).toBe(carteira);
  });

  it('deve lançar erro ao falhar inserção da despesa', async () => {
    despesaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirDespesa(new Despesa())).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir despesa'),
    );
  });

  it('deve listar carteiras com saldo atual', async () => {
    dataSource.query.mockResolvedValue([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: '12000',
      },
    ]);

    const result = await service.listarCarteiras();

    expect(result).toEqual([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: 12000,
      },
    ]);
  });
});
