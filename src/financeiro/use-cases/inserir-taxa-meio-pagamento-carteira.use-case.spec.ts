import { BadRequestException } from '@nestjs/common';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { Carteira, TaxaMeioPagamentoCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { InserirTaxaMeioPagamentoCarteiraUseCase } from './inserir-taxa-meio-pagamento-carteira.use-case';

describe('InserirTaxaMeioPagamentoCarteiraUseCase', () => {
  let useCase: InserirTaxaMeioPagamentoCarteiraUseCase;
  let taxaService: { salvarTaxaMeioPagamentoCarteira: jest.Mock };
  let carteiraService: { garantirCarteiraPorId: jest.Mock };
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    taxaService = {
      salvarTaxaMeioPagamentoCarteira: jest.fn(),
    };
    carteiraService = {
      garantirCarteiraPorId: jest.fn(),
    };
    currentUserContext = { usuarioId: 7 };

    useCase = new InserirTaxaMeioPagamentoCarteiraUseCase(
      taxaService as unknown as TaxaMeioPagamentoCarteiraService,
      carteiraService as unknown as CarteiraService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve inserir taxa quando a carteira aceita o meio de pagamento', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      meiosPagamento: [MeioPagamento.PIX],
    });
    const taxa = Object.assign(new TaxaMeioPagamentoCarteira(), { id: 1 });
    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);
    taxaService.salvarTaxaMeioPagamentoCarteira.mockResolvedValue(taxa);

    const result = await useCase.execute({
      idCarteira: 1,
      meioPagamento: MeioPagamento.PIX,
      percentual: 2.99,
      ativa: true,
    });

    expect(taxaService.salvarTaxaMeioPagamentoCarteira).toHaveBeenCalledWith(
      expect.objectContaining({
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        percentual: 2.99,
        ativa: true,
        idUsuarioInclusao: 7,
      }),
    );
    expect(result).toBe(taxa);
  });

  it('deve lançar erro quando a carteira não aceita o meio de pagamento', async () => {
    const carteira = Object.assign(new Carteira(), {
      id: 1,
      meiosPagamento: [MeioPagamento.DIN],
    });
    carteiraService.garantirCarteiraPorId.mockResolvedValue(carteira);

    await expect(
      useCase.execute({
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
