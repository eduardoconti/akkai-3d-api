import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Carteira, TaxaMeioPagamentoCarteira } from '@financeiro/entities';
import { TaxaMeioPagamentoCarteiraService } from './taxa-meio-pagamento-carteira.service';

describe('TaxaMeioPagamentoCarteiraService', () => {
  let service: TaxaMeioPagamentoCarteiraService;
  let taxaRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    taxaRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxaMeioPagamentoCarteiraService,
        {
          provide: getRepositoryToken(TaxaMeioPagamentoCarteira),
          useValue: taxaRepository,
        },
      ],
    }).compile();

    service = module.get<TaxaMeioPagamentoCarteiraService>(
      TaxaMeioPagamentoCarteiraService,
    );
  });

  it('deve salvar taxa com sucesso', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), {
      id: 1,
      idCarteira: 2,
      meioPagamento: MeioPagamento.PIX,
      percentual: 2.99,
      ativa: true,
    });
    taxaRepository.save.mockResolvedValue(taxa);

    const result = await service.salvarTaxaMeioPagamentoCarteira(taxa);

    expect(taxaRepository.save).toHaveBeenCalledWith(taxa);
    expect(result).toBe(taxa);
  });

  it('deve lançar conflito ao salvar taxa duplicada', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), {
      idCarteira: 2,
      meioPagamento: MeioPagamento.PIX,
      percentual: 2.99,
    });
    taxaRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvarTaxaMeioPagamentoCarteira(taxa)).rejects.toThrow(
      new ConflictException(
        'Já existe uma taxa cadastrada para esta carteira e meio de pagamento.',
      ),
    );
  });

  it('deve lançar erro interno ao falhar salvamento da taxa', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), {
      idCarteira: 2,
      meioPagamento: MeioPagamento.PIX,
      percentual: 2.99,
    });
    taxaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvarTaxaMeioPagamentoCarteira(taxa)).rejects.toThrow(
      new InternalServerErrorException(
        'Erro ao salvar taxa por meio de pagamento e carteira',
      ),
    );
  });

  it('deve listar taxas com carteira ordenadas', async () => {
    const carteira = Object.assign(new Carteira(), { id: 1, nome: 'Carteira' });
    const taxas = [
      Object.assign(new TaxaMeioPagamentoCarteira(), {
        id: 1,
        carteira,
      }),
    ];
    taxaRepository.find.mockResolvedValue(taxas);

    const result = await service.listarTaxasMeioPagamentoCarteira();

    expect(taxaRepository.find).toHaveBeenCalledWith({
      relations: { carteira: true },
      order: {
        carteira: { nome: 'ASC' },
        meioPagamento: 'ASC',
      },
    });
    expect(result).toBe(taxas);
  });

  it('deve obter taxa por id', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), { id: 1 });
    taxaRepository.findOne.mockResolvedValue(taxa);

    const result = await service.obterTaxaMeioPagamentoCarteiraPorId(1);

    expect(taxaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { carteira: true },
    });
    expect(result).toBe(taxa);
  });

  it('deve garantir taxa por id', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), { id: 1 });
    taxaRepository.findOne.mockResolvedValue(taxa);

    await expect(
      service.garantirTaxaMeioPagamentoCarteiraPorId(1),
    ).resolves.toBe(taxa);
  });

  it('deve lançar erro ao garantir taxa inexistente', async () => {
    taxaRepository.findOne.mockResolvedValue(null);

    await expect(
      service.garantirTaxaMeioPagamentoCarteiraPorId(99),
    ).rejects.toThrow(
      new NotFoundException(
        'Taxa por meio de pagamento e carteira com ID 99 não encontrada.',
      ),
    );
  });

  it('deve obter taxa ativa por carteira e pagamento', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), { id: 1 });
    taxaRepository.findOne.mockResolvedValue(taxa);

    const result = await service.obterTaxaAtivaPorCarteiraEMeioPagamento(
      2,
      MeioPagamento.PIX,
    );

    expect(taxaRepository.findOne).toHaveBeenCalledWith({
      where: { idCarteira: 2, meioPagamento: MeioPagamento.PIX, ativa: true },
    });
    expect(result).toBe(taxa);
  });

  it('deve excluir taxa existente', async () => {
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), { id: 1 });
    taxaRepository.findOne.mockResolvedValue(taxa);
    taxaRepository.remove.mockResolvedValue(taxa);

    await service.excluirTaxaMeioPagamentoCarteira(1);

    expect(taxaRepository.remove).toHaveBeenCalledWith(taxa);
  });
});
