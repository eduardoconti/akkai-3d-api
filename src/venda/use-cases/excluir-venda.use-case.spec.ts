import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { ExcluirVendaUseCase } from '@venda/use-cases';

describe('ExcluirVendaUseCase', () => {
  it('deve excluir venda sem criar movimentos de ajuste', async () => {
    const vendaExistente = Venda.criar({
      dataVenda: '2026-04-01T12:00:00.000Z',
      tipo: TipoVenda.LOJA,
      itens: [
        {
          idProduto: 10,
          nomeProduto: 'Produto antigo',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.DIN, valor: 2000 },
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

    await useCase.execute({ id: 5 });

    expect(garantirExisteVenda).toHaveBeenCalledWith(5);
    expect(excluirVenda).toHaveBeenCalledWith(vendaExistente);
  });
});
