import { BadRequestException } from '@nestjs/common';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { FechamentoConsignacao } from '@consignacao/contracts';
import { ConsultaCarteira, ConsultaTaxaPagamento } from '@financeiro/contracts';
import { FecharConsignacaoUseCase } from './fechar-consignacao.use-case';

describe('FecharConsignacaoUseCase', () => {
  const resposta = { id: 1, status: 'FECHADA', itens: [] };
  let consignacaoService: { fecharConsignacao: jest.Mock };
  let consultaCarteira: {
    garantirCarteiraAceitaMeioPagamento: jest.Mock;
  };
  let consultaTaxaPagamento: {
    obterTaxaAtivaPorCarteiraEMeioPagamento: jest.Mock;
  };
  let useCase: FecharConsignacaoUseCase;

  beforeEach(() => {
    consignacaoService = {
      fecharConsignacao: jest.fn().mockResolvedValue(resposta),
    };
    consultaCarteira = {
      garantirCarteiraAceitaMeioPagamento: jest.fn().mockResolvedValue({
        consideraImpostoVenda: true,
        percentualImpostoVenda: 5,
      }),
    };
    consultaTaxaPagamento = {
      obterTaxaAtivaPorCarteiraEMeioPagamento: jest
        .fn()
        .mockResolvedValue({ percentual: 2 }),
    };
    useCase = new FecharConsignacaoUseCase(
      consignacaoService as unknown as FechamentoConsignacao,
      consultaCarteira as unknown as ConsultaCarteira,
      consultaTaxaPagamento as unknown as ConsultaTaxaPagamento,
      { usuarioId: 7 } as never,
    );
  });

  it('deve preparar o pagamento quando houver venda', async () => {
    await useCase.execute(1, {
      idCarteira: 4,
      meioPagamento: MeioPagamento.PIX,
      itens: [{ idItem: 2, quantidadeVendida: 3 }],
    });

    expect(
      consultaCarteira.garantirCarteiraAceitaMeioPagamento,
    ).toHaveBeenCalledWith(4, MeioPagamento.PIX);
    expect(consignacaoService.fecharConsignacao).toHaveBeenCalledWith(
      1,
      [{ idItem: 2, quantidadeVendida: 3 }],
      {
        idCarteira: 4,
        meioPagamento: MeioPagamento.PIX,
        percentualTaxa: 2,
        percentualImposto: 5,
      },
      7,
    );
  });

  it('deve dispensar pagamento quando todo o saldo for devolvido', async () => {
    await useCase.execute(1, {
      itens: [{ idItem: 2, quantidadeVendida: 0 }],
    });

    expect(
      consultaCarteira.garantirCarteiraAceitaMeioPagamento,
    ).not.toHaveBeenCalled();
    expect(consignacaoService.fecharConsignacao).toHaveBeenCalledWith(
      1,
      [{ idItem: 2, quantidadeVendida: 0 }],
      undefined,
      7,
    );
  });

  it('deve rejeitar venda sem dados de pagamento', async () => {
    await expect(
      useCase.execute(1, {
        itens: [{ idItem: 2, quantidadeVendida: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(consignacaoService.fecharConsignacao).not.toHaveBeenCalled();
  });
});
