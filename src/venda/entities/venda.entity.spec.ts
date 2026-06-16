import {
  ItemVenda,
  ItemVendaInput,
  MeioPagamento,
  PagamentoVenda,
  TipoVenda,
  Venda,
} from '@venda/entities';

describe('Venda', () => {
  const dataVenda = '2026-04-01T12:00:00.000Z';

  it('deve limpar a relação feira ao chamar atualizar', () => {
    const venda = new Venda();
    venda.feira = { id: 5 } as never;
    venda.idFeira = 5;
    venda.itens = [];

    venda.atualizar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [],
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.DIN, valor: 0 },
      ],
    });

    expect(venda.feira).toBeUndefined();
    expect(venda.idFeira).toBeUndefined();
  });

  it('deve atribuir orçamento e limpar relação ao chamar atualizar', () => {
    const venda = new Venda();
    venda.orcamento = { id: 8 } as never;

    venda.atualizar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      idOrcamento: 8,
      itens: [],
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.DIN, valor: 0 },
      ],
    });

    expect(venda.idOrcamento).toBe(8);
    expect(venda.orcamento).toBeUndefined();
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
      dataVenda,
      tipo: TipoVenda.FEIRA,
      desconto: 10,
      itens,
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.DIN, valor: 190 },
      ],
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
      dataVenda,
      tipo: TipoVenda.FEIRA,
      itens,
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.DIN, valor: 200 },
      ],
    });

    expect(venda.valorTotal).toBe(200);
  });

  it('deve calcular valor da taxa no pagamento quando percentualTaxa for informado', () => {
    const venda = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [
        {
          idProduto: 1,
          nomeProduto: 'Caneca',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
      pagamentos: [
        {
          idCarteira: 1,
          meioPagamento: MeioPagamento.CRE,
          valor: 2000,
          percentualTaxa: 5,
        },
      ],
    });

    expect(venda.pagamentos[0]?.percentualTaxa).toBe(5);
    expect(venda.pagamentos[0]?.valorTaxa).toBe(100);
  });

  it('deve deixar taxa do pagamento nula quando percentualTaxa não for informado', () => {
    const venda = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [
        {
          idProduto: 1,
          nomeProduto: 'Caneca',
          quantidade: 1,
          valorUnitario: 1000,
        },
      ],
      pagamentos: [
        { idCarteira: 1, meioPagamento: MeioPagamento.CRE, valor: 1000 },
      ],
    });

    expect(venda.pagamentos[0]?.percentualTaxa).toBeNull();
    expect(venda.pagamentos[0]?.valorTaxa).toBeNull();
  });

  it('deve calcular valor do imposto no pagamento quando percentualImposto for informado', () => {
    const venda = Venda.criar({
      dataVenda,
      tipo: TipoVenda.LOJA,
      itens: [
        {
          idProduto: 1,
          nomeProduto: 'Caneca',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
      pagamentos: [
        {
          idCarteira: 1,
          meioPagamento: MeioPagamento.CRE,
          valor: 2000,
          percentualImposto: 4,
        },
      ],
    });

    expect(venda.pagamentos[0]?.percentualImposto).toBe(4);
    expect(venda.pagamentos[0]?.valorImposto).toBe(80);
  });

  it('deve calcular valor líquido descontando taxas e impostos dos pagamentos', () => {
    const venda = Object.assign(new Venda(), {
      valorTotal: 2000,
      pagamentos: [
        Object.assign(new PagamentoVenda(), {
          valorTaxa: 50,
          valorImposto: 80,
        }),
        Object.assign(new PagamentoVenda(), {
          valorTaxa: 30,
          valorImposto: 40,
        }),
      ],
    });

    expect(venda.calcularValorLiquido()).toBe(1800);
  });

  it('deve lançar BadRequestException quando soma dos pagamentos divergir do total', () => {
    expect(() =>
      Venda.criar({
        dataVenda,
        tipo: TipoVenda.LOJA,
        itens: [
          {
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 1,
            valorUnitario: 500,
          },
        ],
        pagamentos: [
          { idCarteira: 1, meioPagamento: MeioPagamento.PIX, valor: 400 },
        ],
      }),
    ).toThrow('A soma dos pagamentos deve ser igual ao valor total da venda.');
  });

  it('deve lançar BadRequestException quando desconto for maior que o total dos itens', () => {
    expect(() =>
      Venda.criar({
        dataVenda,
        tipo: TipoVenda.LOJA,
        desconto: 1000,
        itens: [
          {
            idProduto: 1,
            nomeProduto: 'Caneca',
            quantidade: 1,
            valorUnitario: 500,
          },
        ],
        pagamentos: [
          { idCarteira: 1, meioPagamento: MeioPagamento.PIX, valor: 0 },
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
