import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { ExcluirVendaUseCase } from '@venda/use-cases';

describe('ExcluirVendaUseCase', () => {
  it('deve excluir venda sem criar movimentos de ajuste', async () => {
    const vendaExistente = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [
        {
          idProduto: 10,
          nomeProduto: 'Produto antigo',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
    });
    vendaExistente.id = 5;

    const garantirExisteVenda = jest.fn().mockResolvedValue(vendaExistente);
    const excluirVenda = jest.fn().mockResolvedValue(undefined);
    const vendaService = {
      garantirExisteVenda,
      excluirVenda,
    } as unknown as VendaService;

    const useCase = new ExcluirVendaUseCase(vendaService);

    await useCase.execute(5);

    expect(garantirExisteVenda).toHaveBeenCalledWith(5);
    expect(excluirVenda).toHaveBeenCalledWith(vendaExistente);
  });
});
