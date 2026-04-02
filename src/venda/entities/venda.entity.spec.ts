import {
  ItemVenda,
  ItemVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
} from '@venda/entities';

describe('Venda', () => {
  it('deve calcular o valor total corretamente com desconto no item e na venda', () => {
    const itens = [
      {
        quantidade: 2,
        valorUnitario: 50,
        desconto: 5,
        idProduto: 1,
        nomeProduto: 'Caneca geek',
      },
      {
        quantidade: 1,
        valorUnitario: 100,
        desconto: 0,
        idProduto: 2,
        nomeProduto: 'Vaso decorativo',
      },
    ].map((item) => {
      const itemVenda = new ItemVenda();
      itemVenda.quantidade = item.quantidade;
      itemVenda.valorUnitario = item.valorUnitario;
      itemVenda.desconto = item.desconto;
      itemVenda.idProduto = item.idProduto;
      itemVenda.nomeProduto = item.nomeProduto;
      return itemVenda;
    });

    const venda = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
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
        nomeProduto: 'Caneca geek',
      },
      {
        quantidade: 1,
        valorUnitario: 100,
        idProduto: 2,
        nomeProduto: 'Vaso decorativo',
      },
    ].map((item) => {
      const itemVenda = new ItemVenda();
      itemVenda.quantidade = item.quantidade;
      itemVenda.valorUnitario = item.valorUnitario;
      itemVenda.idProduto = item.idProduto;
      itemVenda.nomeProduto = item.nomeProduto;
      return itemVenda;
    });

    const venda = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
      itens,
    });

    expect(venda.valorTotal).toBe(200);
  });
});

describe('ItemVenda', () => {
  const base: ItemVendaInput = {
    nomeProduto: 'Caneca',
    quantidade: 2,
    valorUnitario: 1000,
  };

  it('deve calcular valor total corretamente sem desconto', () => {
    const item = ItemVenda.criar(base);
    expect(item.valorTotal).toBe(2000);
    expect(item.desconto).toBe(0);
  });

  it('deve calcular valor total com desconto', () => {
    const item = ItemVenda.criar({ ...base, desconto: 300 });
    expect(item.valorTotal).toBe(1700);
    expect(item.desconto).toBe(300);
  });

  it('deve atribuir idProduto quando informado', () => {
    const item = ItemVenda.criar({ ...base, idProduto: 5 });
    expect(item.idProduto).toBe(5);
  });

  it('deve deixar idProduto undefined quando não informado', () => {
    const item = ItemVenda.criar(base);
    expect(item.idProduto).toBeUndefined();
  });

  it('deve definir id via setId', () => {
    const item = new ItemVenda();
    item.setId(42);
    expect(item.id).toBe(42);
  });

  it('deve definir idVenda via setIdVenda', () => {
    const item = new ItemVenda();
    item.setIdVenda(10);
    expect(item.idVenda).toBe(10);
  });
});
