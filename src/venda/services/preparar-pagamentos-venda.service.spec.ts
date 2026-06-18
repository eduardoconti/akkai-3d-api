import { NotFoundException } from '@nestjs/common';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { MeioPagamento } from '@venda/entities';
import { PrepararPagamentosVendaService } from '@venda/services';

describe('PrepararPagamentosVendaService', () => {
  let service: PrepararPagamentosVendaService;
  let garantirCarteiraAceitaMeioPagamentoMock: jest.Mock;
  let obterTaxaAtivaPorCarteiraEMeioPagamentoMock: jest.Mock;

  beforeEach(() => {
    garantirCarteiraAceitaMeioPagamentoMock = jest.fn();
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock = jest.fn();

    service = new PrepararPagamentosVendaService(
      {
        garantirCarteiraAceitaMeioPagamento:
          garantirCarteiraAceitaMeioPagamentoMock,
      } as unknown as CarteiraService,
      {
        obterTaxaAtivaPorCarteiraEMeioPagamento:
          obterTaxaAtivaPorCarteiraEMeioPagamentoMock,
      } as unknown as TaxaMeioPagamentoCarteiraService,
    );
  });

  it('deve preparar pagamento com taxa e imposto da carteira', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      consideraImpostoVenda: true,
      percentualImpostoVenda: 4,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue({
      percentual: 2.5,
    });

    const result = await service.preparar([
      {
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        valor: 4800,
      },
    ]);

    expect(garantirCarteiraAceitaMeioPagamentoMock).toHaveBeenCalledWith(
      1,
      MeioPagamento.PIX,
    );
    expect(obterTaxaAtivaPorCarteiraEMeioPagamentoMock).toHaveBeenCalledWith(
      1,
      MeioPagamento.PIX,
    );
    expect(result).toEqual([
      {
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        valor: 4800,
        percentualTaxa: 2.5,
        percentualImposto: 4,
      },
    ]);
  });

  it('deve preparar pagamento sem taxa e sem imposto quando não aplicáveis', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue({
      consideraImpostoVenda: false,
      percentualImpostoVenda: 4,
    });
    obterTaxaAtivaPorCarteiraEMeioPagamentoMock.mockResolvedValue(null);

    const result = await service.preparar([
      {
        idCarteira: 2,
        meioPagamento: MeioPagamento.DIN,
        valor: 1000,
      },
    ]);

    expect(result).toEqual([
      {
        idCarteira: 2,
        meioPagamento: MeioPagamento.DIN,
        valor: 1000,
        percentualTaxa: null,
        percentualImposto: null,
      },
    ]);
  });

  it('deve propagar erro quando carteira não aceitar o meio de pagamento', async () => {
    garantirCarteiraAceitaMeioPagamentoMock.mockRejectedValue(
      new NotFoundException('Carteira com ID 99 não encontrada.'),
    );

    await expect(
      service.preparar([
        {
          idCarteira: 99,
          meioPagamento: MeioPagamento.PIX,
          valor: 1000,
        },
      ]),
    ).rejects.toThrow('Carteira com ID 99 não encontrada.');
  });
});
