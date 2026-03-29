import { MeioPagamento, TipoVenda, Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';

describe('Venda', () => {
  it('deve calcular o valor total corretamente com desconto no item e na venda', () => {
    const itens = [
      {
        quantidade: 2,
        valorUnitario: 50,
        desconto: 5,
        idProduto: 1,
      },
      {
        quantidade: 1,
        valorUnitario: 100,
        desconto: 0,
        idProduto: 2,
      },
    ].map((item) => {
      const itemVenda = new ItemVenda();
      itemVenda.quantidade = item.quantidade;
      itemVenda.valorUnitario = item.valorUnitario;
      itemVenda.desconto = item.desconto;
      itemVenda.idProduto = item.idProduto;
      return itemVenda;
    });

    const venda = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      desconto: 10,
      itens,
    });

    expect(venda.valorTotal).toBe(185);
  });

  it('deve calcular o valor total corretamente sem descontos', () => {
    const itens = [
      {
        quantidade: 2,
        valorUnitario: 50,
        idProduto: 1,
      },
      {
        quantidade: 1,
        valorUnitario: 100,
        idProduto: 2,
      },
    ].map((item) => {
      const itemVenda = new ItemVenda();
      itemVenda.quantidade = item.quantidade;
      itemVenda.valorUnitario = item.valorUnitario;
      itemVenda.idProduto = item.idProduto;
      return itemVenda;
    });

    const venda = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      itens,
    });

    expect(venda.valorTotal).toBe(200);
  });
});
