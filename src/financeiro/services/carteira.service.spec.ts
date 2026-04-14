import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Carteira } from '@financeiro/entities';
import { CarteiraService } from './carteira.service';
import { MeioPagamento } from '@venda/entities/meio-pagamento.enum';

describe('CarteiraService', () => {
  let service: CarteiraService;
  let carteiraRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    findOne: jest.Mock;
  };
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    carteiraRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      findOne: jest.fn(),
    };
    dataSource = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarteiraService,
        {
          provide: getRepositoryToken(Carteira),
          useValue: carteiraRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<CarteiraService>(CarteiraService);
  });

  it('deve salvar carteira com sucesso', async () => {
    const carteira = Object.assign(new Carteira(), { id: 1, nome: 'CAIXA' });
    carteiraRepository.save.mockResolvedValue(carteira);

    const result = await service.salvarCarteira(carteira);

    expect(result).toBe(carteira);
  });

  it('deve lançar ConflictException ao salvar carteira com nome duplicado', async () => {
    const carteira = Object.assign(new Carteira(), { nome: 'CAIXA' });
    carteiraRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvarCarteira(carteira)).rejects.toThrow(
      new ConflictException('Carteira CAIXA já existe'),
    );
  });

  it('deve lançar InternalServerErrorException ao falhar salvamento de carteira', async () => {
    const carteira = Object.assign(new Carteira(), { nome: 'CAIXA' });
    carteiraRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvarCarteira(carteira)).rejects.toThrow(
      new InternalServerErrorException('Erro ao salvar carteira'),
    );
  });

  it('deve obter carteira por id', async () => {
    carteiraRepository.findOne.mockResolvedValue({ id: 1 });

    const result = await service.obterCarteiraPorId(1);

    expect(carteiraRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({ id: 1 });
  });

  it('deve garantir carteira por id retornando a carteira', async () => {
    const carteira = Object.assign(new Carteira(), { id: 1, nome: 'CAIXA' });
    carteiraRepository.findOne.mockResolvedValue(carteira);

    const result = await service.garantirCarteiraPorId(1);

    expect(result).toBe(carteira);
  });

  it('deve lançar NotFoundException quando carteira não existir em garantirCarteiraPorId', async () => {
    carteiraRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirCarteiraPorId(99)).rejects.toThrow(
      new NotFoundException('Carteira não encontrada'),
    );
  });

  it('deve verificar existência de carteira ativa', async () => {
    carteiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeCarteira(3);

    expect(carteiraRepository.exists).toHaveBeenCalledWith({
      where: { id: 3, ativa: true },
    });
    expect(result).toBe(true);
  });

  it('deve não lançar erro quando carteira existir em garantirExisteCarteira', async () => {
    carteiraRepository.exists.mockResolvedValue(true);

    await expect(service.garantirExisteCarteira(1)).resolves.not.toThrow();
  });

  it('deve lançar NotFoundException quando carteira não existir em garantirExisteCarteira', async () => {
    carteiraRepository.exists.mockResolvedValue(false);

    await expect(service.garantirExisteCarteira(99)).rejects.toThrow(
      new NotFoundException('Carteira com ID 99 não encontrada.'),
    );
  });

  it('deve garantir carteira aceita meio de pagamento quando lista estiver vazia', async () => {
    carteiraRepository.findOne.mockResolvedValue(
      Object.assign(new Carteira(), { id: 1, ativa: true, meiosPagamento: [] }),
    );

    await expect(
      service.garantirCarteiraAceitaMeioPagamento(1, MeioPagamento.PIX),
    ).resolves.not.toThrow();
  });

  it('deve garantir carteira aceita meio de pagamento quando ele está na lista', async () => {
    carteiraRepository.findOne.mockResolvedValue(
      Object.assign(new Carteira(), {
        id: 1,
        ativa: true,
        meiosPagamento: [MeioPagamento.PIX, MeioPagamento.DIN],
      }),
    );

    await expect(
      service.garantirCarteiraAceitaMeioPagamento(1, MeioPagamento.PIX),
    ).resolves.not.toThrow();
  });

  it('deve lançar BadRequestException quando meio de pagamento não for aceito pela carteira', async () => {
    carteiraRepository.findOne.mockResolvedValue(
      Object.assign(new Carteira(), {
        id: 1,
        ativa: true,
        meiosPagamento: [MeioPagamento.PIX],
      }),
    );

    await expect(
      service.garantirCarteiraAceitaMeioPagamento(1, MeioPagamento.DIN),
    ).rejects.toThrow(
      new BadRequestException(
        `A carteira não aceita o meio de pagamento ${MeioPagamento.DIN}.`,
      ),
    );
  });

  it('deve lançar NotFoundException quando carteira não existir em garantirCarteiraAceitaMeioPagamento', async () => {
    carteiraRepository.findOne.mockResolvedValue(null);

    await expect(
      service.garantirCarteiraAceitaMeioPagamento(99, MeioPagamento.PIX),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException quando carteira estiver inativa em garantirCarteiraAceitaMeioPagamento', async () => {
    carteiraRepository.findOne.mockResolvedValue(
      Object.assign(new Carteira(), {
        id: 1,
        ativa: false,
        meiosPagamento: [],
      }),
    );

    await expect(
      service.garantirCarteiraAceitaMeioPagamento(1, MeioPagamento.PIX),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve listar carteiras com saldo atual e meios de pagamento', async () => {
    dataSource.query.mockResolvedValue([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: '12000',
        meiosPagamento: '["PIX","DIN"]',
      },
    ]);

    const result = await service.listarCarteiras();

    expect(result).toEqual([
      {
        id: 1,
        nome: 'CAIXA',
        ativa: true,
        saldoAtual: 12000,
        meiosPagamento: ['PIX', 'DIN'],
      },
    ]);
  });
});
