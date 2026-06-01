import { ConsignacaoService } from '@consignacao/services';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import { MeioPagamento } from '@venda/entities';
import { RegistrarVendasRevendedorConsignadoUseCase } from './registrar-vendas-revendedor-consignado.use-case';

describe('RegistrarVendasRevendedorConsignadoUseCase', () => {
  it('deve registrar vendas por revendedor com dados financeiros', async () => {
    const resposta = [{ id: 1, itens: [] }];
    const consignacaoService = {
      registrarVendasPorRevendedor: jest.fn().mockResolvedValue(resposta),
    };
    const carteiraService = {
      garantirCarteiraAceitaMeioPagamento: jest.fn().mockResolvedValue({
        consideraImpostoVenda: true,
        percentualImpostoVenda: 5,
      }),
    };
    const taxaMeioPagamentoCarteiraService = {
      obterTaxaAtivaPorCarteiraEMeioPagamento: jest
        .fn()
        .mockResolvedValue({ percentual: 2 }),
    };
    const currentUserContext = { usuarioId: 7 };
    const useCase = new RegistrarVendasRevendedorConsignadoUseCase(
      consignacaoService as unknown as ConsignacaoService,
      carteiraService as unknown as CarteiraService,
      taxaMeioPagamentoCarteiraService as unknown as TaxaMeioPagamentoCarteiraService,
      currentUserContext as never,
    );

    const resultado = await useCase.execute({
      idRevendedor: 3,
      idCarteira: 4,
      meioPagamento: MeioPagamento.PIX,
      itens: [
        { idProduto: 10, quantidade: 2 },
        { idProduto: 20, quantidade: 1 },
      ],
    });

    expect(resultado).toBe(resposta);
    expect(
      carteiraService.garantirCarteiraAceitaMeioPagamento,
    ).toHaveBeenCalledWith(4, MeioPagamento.PIX);
    expect(
      taxaMeioPagamentoCarteiraService.obterTaxaAtivaPorCarteiraEMeioPagamento,
    ).toHaveBeenCalledWith(4, MeioPagamento.PIX);
    expect(
      consignacaoService.registrarVendasPorRevendedor,
    ).toHaveBeenCalledWith(
      3,
      [
        { idProduto: 10, quantidade: 2 },
        { idProduto: 20, quantidade: 1 },
      ],
      {
        idCarteira: 4,
        meioPagamento: MeioPagamento.PIX,
        percentualTaxa: 2,
        percentualImposto: 5,
      },
      7,
    );
  });
});
