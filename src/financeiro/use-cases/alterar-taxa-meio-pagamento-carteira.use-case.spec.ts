import { BadRequestException } from '@nestjs/common';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { Carteira, TaxaMeioPagamentoCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { AlterarTaxaMeioPagamentoCarteiraUseCase } from './alterar-taxa-meio-pagamento-carteira.use-case';

describe('AlterarTaxaMeioPagamentoCarteiraUseCase', () => {
  let useCase: AlterarTaxaMeioPagamentoCarteiraUseCase;
  let taxaService: {
    garantirTaxaMeioPagamentoCarteiraPorId: jest.Mock;
    salvarTaxaMeioPagamentoCarteira: jest.Mock;
  };
  let carteiraService: { garantirCarteiraPorId: jest.Mock };

  beforeEach(() => {
    taxaService = {
      garantirTaxaMeioPagamentoCarteiraPorId: jest.fn(),
      salvarTaxaMeioPagamentoCarteira: jest.fn(),
    };
    carteiraService = {
      garantirCarteiraPorId: jest.fn(),
    };

    useCase = new AlterarTaxaMeioPagamentoCarteiraUseCase(
      taxaService as unknown as TaxaMeioPagamentoCarteiraService,
      carteiraService as unknown as CarteiraService,
    );
  });

  it('deve alterar taxa quando a carteira aceita o meio de pagamento', async () => {
    const taxa = TaxaMeioPagamentoCarteira.criar({
      idCarteira: 1,
      meioPagamento: MeioPagamento.PIX,
      percentual: 1.99,
      ativa: true,
      idUsuarioInclusao: 5,
    });
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      meiosPagamento: [MeioPagamento.PIX],
    });
    taxaService.garantirTaxaMeioPagamentoCarteiraPorId.mockResolvedValue(taxa);
    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    taxaService.salvarTaxaMeioPagamentoCarteira.mockResolvedValue(taxa);

    const result = await useCase.execute({
      id: 1,
      idCarteira: 1,
      meioPagamento: MeioPagamento.PIX,
      percentual: 2.99,
      ativa: false,
    });

    expect(taxaService.salvarTaxaMeioPagamentoCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        percentual: 2.99,
        ativa: false,
      }),
    );
    expect(result).toBe(taxa);
  });

  it('deve lançar erro quando a carteira não aceita o meio de pagamento', async () => {
    const taxa = TaxaMeioPagamentoCarteira.criar({
      idCarteira: 1,
      meioPagamento: MeioPagamento.PIX,
      percentual: 1.99,
      ativa: true,
      idUsuarioInclusao: 5,
    });
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      meiosPagamento: [MeioPagamento.DIN],
    });
    taxaService.garantirTaxaMeioPagamentoCarteiraPorId.mockResolvedValue(taxa);
    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);

    await expect(
      useCase.execute({
        id: 1,
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        percentual: 2.99,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'A carteira não aceita o meio de pagamento PIX.',
      ),
    );
  });
});
