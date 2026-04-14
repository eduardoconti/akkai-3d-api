import { Carteira } from '@financeiro/entities/carteira.entity';
import {
  ItemVenda,
  ItemVendaInput,
  MeioPagamento,
  TipoVenda,
  Venda,
} from '@venda/entities';

describe('Venda', () => {
  it('deve limpar a relação carteira ao chamar atualizar', () => {
    const venda = new Venda();
    venda.carteira = Object.assign(new Carteira(), { id: 1 });
    venda.idCarteira = 1;
    venda.itens = [];

    venda.atualizar({
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.LOJA,
      idCarteira: 2,
      itens: [],
    });

    expect(venda.carteira).toBeUndefined();
    expect(venda.idCarteira).toBe(2);
  });

  it('deve limpar a relação feira ao chamar atualizar', () => {
    const venda = new Venda();
    venda.feira = { id: 5 } as never;
    venda.idFeira = 5;
    venda.itens = [];

    venda.atualizar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [],
    });

    expect(venda.feira).toBeUndefined();
    expect(venda.idFeira).toBeUndefined();
  });

  it('deve calcular o valor total corretamente com desconto apenas na venda', () => {
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
      itemVenda.valorTotal = item.quantidade * item.valorUnitario;
      return itemVenda;
    });

    const venda = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.FEIRA,
      idCarteira: 1,
      desconto: 10,
      itens,
    });

    expect(venda.valorTotal).toBe(190);
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
      itemVenda.valorTotal = item.quantidade * item.valorUnitario;
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

  it('deve calcular valor da taxa quando percentualTaxa for informado', () => {
    const venda = Venda.criar({
      meioPagamento: MeioPagamento.CRE,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      percentualTaxa: 5,
      itens: [
        {
          idProduto: 1,
          nomeProduto: 'Caneca',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
    });

    expect(venda.percentualTaxa).toBe(5);
    expect(venda.valorTaxa).toBe(100);
  });

  it('deve deixar taxa nula quando percentualTaxa não for informado', () => {
    const venda = Venda.criar({
      meioPagamento: MeioPagamento.CRE,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [
        {
          idProduto: 1,
          nomeProduto: 'Caneca',
          quantidade: 1,
          valorUnitario: 1000,
        },
      ],
    });

    expect(venda.percentualTaxa).toBeNull();
    expect(venda.valorTaxa).toBeNull();
  });

  it('deve lançar BadRequestException quando desconto for maior que o total dos itens', () => {
    expect(() =>
      Venda.criar({
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.LOJA,
        idCarteira: 1,
        desconto: 1000,
        itens: [
          {
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 1,
            valorUnitario: 500,
          },
        ],
      }),
    ).toThrow('O desconto não pode ser maior que o valor total dos itens.');
  });
});

describe('ItemVenda', () => {
  const base: ItemVendaInput = {
    nomeProduto: 'Caneca',
    quantidade: 2,
    valorUnitario: 1000,
  };

  it('deve calcular valor total corretamente', () => {
    const item = ItemVenda.criar(base);
    expect(item.valorTotal).toBe(2000);
  });

  it('deve zerar valor unitário e valor total quando o item for brinde', () => {
    const item = ItemVenda.criar({ ...base, brinde: true });
    expect(item.brinde).toBe(true);
    expect(item.valorUnitario).toBe(0);
    expect(item.valorTotal).toBe(0);
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
