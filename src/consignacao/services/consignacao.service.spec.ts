import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  Consignacao,
  ItemConsignacao,
  Revendedor,
  StatusConsignacao,
  StatusRevendedor,
} from '@consignacao/entities';
import {
  OrigemMovimentacaoEstoque,
  MovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { ConsignacaoService } from './consignacao.service';

type GerenciadorTransacaoTeste = {
  delete: jest.Mock;
  save: jest.Mock;
};

type CallbackTransacaoTeste = (manager: GerenciadorTransacaoTeste) => unknown;

describe('ConsignacaoService', () => {
  let service: ConsignacaoService;
  let consignacaoRepository: { find: jest.Mock; findOne: jest.Mock };
  let itemConsignacaoRepository: {
    findOne: jest.Mock;
  };
  let dataSource: {
    transaction: jest.Mock<Promise<unknown>, [CallbackTransacaoTeste]>;
  };

  beforeEach(() => {
    consignacaoRepository = { find: jest.fn(), findOne: jest.fn() };
    itemConsignacaoRepository = {
      findOne: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((callback: CallbackTransacaoTeste) =>
        Promise.resolve(callback({ delete: jest.fn(), save: jest.fn() })),
      ),
    };

    service = new ConsignacaoService(
      consignacaoRepository as unknown as Repository<Consignacao>,
      itemConsignacaoRepository as unknown as Repository<ItemConsignacao>,
      dataSource as unknown as DataSource,
    );
  });

  it('deve registrar vendas por revendedor usando as consignações mais antigas', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    const consignacaoAntiga = criarConsignacaoComItens(
      [
        criarItemConsignacao({
          id: 2,
          idConsignacao: 1,
          idProduto: 10,
          quantidadeEnviada: 5,
          quantidadeVendida: 3,
          valorUnitario: 2500,
        }),
      ],
      {
        id: 1,
        dataInclusao: new Date('2026-01-01T00:00:00.000Z'),
        revendedor: criarRevendedorConsignacao({ percentualDesconto: 20 }),
      },
    );
    const consignacaoNova = criarConsignacaoComItens(
      [
        criarItemConsignacao({
          id: 3,
          idConsignacao: 2,
          idProduto: 10,
          quantidadeEnviada: 5,
          valorUnitario: 3000,
        }),
      ],
      {
        id: 2,
        dataInclusao: new Date('2026-01-08T00:00:00.000Z'),
        revendedor: criarRevendedorConsignacao({ percentualDesconto: 20 }),
      },
    );

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    consignacaoRepository.find.mockResolvedValue([
      consignacaoAntiga,
      consignacaoNova,
    ]);
    consignacaoRepository.findOne
      .mockResolvedValueOnce(criarConsignacaoDetalhe({ id: 1 }))
      .mockResolvedValueOnce(criarConsignacaoDetalhe({ id: 2 }));

    await service.registrarVendasPorRevendedor(
      3,
      [{ idProduto: 10, quantidade: 4 }],
      {
        idCarteira: 4,
        meioPagamento: MeioPagamento.PIX,
        percentualTaxa: 2,
        percentualImposto: 5,
      },
      7,
    );

    expect(consignacaoAntiga.itens[0]?.quantidadeVendida).toBe(5);
    expect(consignacaoNova.itens[0]?.quantidadeVendida).toBe(2);
    expect(manager.save).toHaveBeenCalledWith(
      Consignacao,
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          status: StatusConsignacao.FECHADA,
        }),
      ]),
    );
    expect(manager.save).toHaveBeenCalledWith(
      Venda,
      expect.arrayContaining([
        expect.objectContaining({
          tipo: TipoVenda.CONSIGNACAO,
          idConsignacao: 1,
          idUsuarioInclusao: 7,
          valorTotal: 4000,
        }),
        expect.objectContaining({
          tipo: TipoVenda.CONSIGNACAO,
          idConsignacao: 2,
          idUsuarioInclusao: 7,
          valorTotal: 4800,
        }),
      ]),
    );
  });

  it('deve informar quando produto não existe nas consignações abertas do revendedor', async () => {
    consignacaoRepository.find.mockResolvedValue([
      criarConsignacaoComItens([
        criarItemConsignacao({ idProduto: 10, quantidadeEnviada: 5 }),
      ]),
    ]);

    await expect(
      service.registrarVendasPorRevendedor(
        3,
        [{ idProduto: 45, quantidade: 1 }],
        { idCarteira: 4, meioPagamento: MeioPagamento.PIX },
        7,
      ),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.registrarVendasPorRevendedor(
        3,
        [{ idProduto: 45, quantidade: 1 }],
        { idCarteira: 4, meioPagamento: MeioPagamento.PIX },
        7,
      ),
    ).rejects.toThrow(
      'Produto com ID 45 não encontrado nas consignações abertas do revendedor.',
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve informar saldo disponível quando venda por revendedor exceder o saldo', async () => {
    consignacaoRepository.find.mockResolvedValue([
      criarConsignacaoComItens([
        criarItemConsignacao({
          idProduto: 10,
          quantidadeEnviada: 5,
          quantidadeVendida: 4,
        }),
      ]),
    ]);

    await expect(
      service.registrarVendasPorRevendedor(
        3,
        [{ idProduto: 10, quantidade: 2 }],
        { idCarteira: 4, meioPagamento: MeioPagamento.PIX },
        7,
      ),
    ).rejects.toThrow(
      'Saldo disponível insuficiente para o produto com ID 10 nas consignações abertas do revendedor. Disponível: 1. Solicitado: 2.',
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve registrar devolução e gerar entrada de estoque', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    itemConsignacaoRepository.findOne.mockResolvedValue(
      criarItemConsignacao({ idProduto: 20, quantidadeEnviada: 5 }),
    );
    consignacaoRepository.findOne.mockResolvedValue(criarConsignacaoDetalhe());

    await service.registrarDevolucao(1, 2, 2, 7);

    expect(manager.save).toHaveBeenCalledWith(
      ItemConsignacao,
      expect.objectContaining({ quantidadeDevolvida: 2 }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      MovimentacaoEstoque,
      expect.objectContaining({
        idProduto: 20,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
        idUsuarioInclusao: 7,
      }),
    );
  });

  it('deve fechar a consignação ao devolver todo o saldo disponível', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    const item = criarItemConsignacao({
      idProduto: 20,
      quantidadeEnviada: 3,
      quantidadeVendida: 2,
    });

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    itemConsignacaoRepository.findOne.mockResolvedValue(item);
    consignacaoRepository.findOne.mockResolvedValue(
      criarConsignacaoDetalhe({ status: StatusConsignacao.FECHADA }),
    );

    await service.registrarDevolucao(1, 2, 1, 7);

    expect(item.consignacao.status).toBe(StatusConsignacao.FECHADA);
    expect(manager.save).toHaveBeenCalledWith(
      Consignacao,
      expect.objectContaining({
        id: 1,
        status: StatusConsignacao.FECHADA,
      }),
    );
  });

  it('deve adicionar item e gerar saída de estoque', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    const item = ItemConsignacao.criar({
      idProduto: 30,
      quantidadeEnviada: 2,
      valorUnitario: 1500,
    });
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: 30,
      quantidade: 2,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: 7,
    });

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    consignacaoRepository.findOne
      .mockResolvedValueOnce(criarConsignacaoComItens([]))
      .mockResolvedValueOnce(criarConsignacaoDetalhe());

    await service.adicionarItem(1, item, movimentacao);

    expect(item.idConsignacao).toBe(1);
    expect(manager.save).toHaveBeenCalledWith(
      ItemConsignacao,
      expect.objectContaining({ idProduto: 30, quantidadeEnviada: 2 }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      MovimentacaoEstoque,
      expect.objectContaining({
        idProduto: 30,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.SAIDA,
      }),
    );
  });

  it('deve impedir adicionar produto repetido na consignação', async () => {
    consignacaoRepository.findOne.mockResolvedValue(
      criarConsignacaoComItens([criarItemConsignacao({ idProduto: 30 })]),
    );

    await expect(
      service.adicionarItem(
        1,
        ItemConsignacao.criar({
          idProduto: 30,
          quantidadeEnviada: 2,
          valorUnitario: 1500,
        }),
        MovimentacaoEstoque.criar({
          idProduto: 30,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
          idUsuarioInclusao: 7,
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve alterar item e gerar entrada quando reduzir quantidade enviada', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    const item = criarItemConsignacao({
      quantidadeEnviada: 5,
      quantidadeVendida: 1,
      quantidadeDevolvida: 1,
      valorUnitario: 2500,
    });
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: item.idProduto,
      quantidade: 2,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: 7,
    });

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    consignacaoRepository.findOne.mockResolvedValue(criarConsignacaoDetalhe());

    await service.alterarItem(item, 3, 2200, movimentacao);

    expect(item.quantidadeEnviada).toBe(3);
    expect(item.valorUnitario).toBe(2200);
    expect(manager.save).toHaveBeenCalledWith(ItemConsignacao, item);
    expect(manager.save).toHaveBeenCalledWith(
      MovimentacaoEstoque,
      movimentacao,
    );
  });

  it('deve impedir quantidade enviada menor que quantidade movimentada', async () => {
    const item = criarItemConsignacao({
      quantidadeEnviada: 5,
      quantidadeVendida: 2,
      quantidadeDevolvida: 1,
    });

    await expect(service.alterarItem(item, 2, 2500)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve excluir item livre e devolver quantidade ao estoque', async () => {
    const manager = { delete: jest.fn(), save: jest.fn() };
    const item = criarItemConsignacao({ quantidadeEnviada: 5 });
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: item.idProduto,
      quantidade: 5,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: 7,
    });

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    consignacaoRepository.findOne.mockResolvedValue(criarConsignacaoDetalhe());

    await service.excluirItem(item, movimentacao);

    expect(manager.delete).toHaveBeenCalledWith(ItemConsignacao, {
      id: item.id,
    });
    expect(manager.save).toHaveBeenCalledWith(
      MovimentacaoEstoque,
      movimentacao,
    );
  });

  it('deve impedir excluir item com venda registrada', async () => {
    const item = criarItemConsignacao({
      quantidadeEnviada: 5,
      quantidadeVendida: 1,
    });

    await expect(
      service.excluirItem(
        item,
        MovimentacaoEstoque.criar({
          idProduto: item.idProduto,
          quantidade: 5,
          tipo: TipoMovimentacaoEstoque.ENTRADA,
          origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
          idUsuarioInclusao: 7,
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});

function criarItemConsignacao(
  parcial: Partial<ItemConsignacao> = {},
): ItemConsignacao {
  const item = Object.assign(new ItemConsignacao(), {
    id: 2,
    idConsignacao: 1,
    idProduto: 10,
    quantidadeEnviada: 5,
    quantidadeVendida: 0,
    quantidadeDevolvida: 0,
    valorUnitario: 2500,
    consignacao: {
      id: 1,
      status: StatusConsignacao.ABERTA,
    },
    produto: {
      id: parcial.idProduto ?? 10,
      nome: `Produto ${parcial.idProduto ?? 10}`,
      codigo: parcial.idProduto ?? 10,
    },
    ...parcial,
  });

  item.consignacao.itens ??= [item];
  return item;
}

function criarConsignacaoDetalhe(
  parcial: Partial<Consignacao> = {},
): Consignacao {
  const item = criarItemConsignacao({ quantidadeVendida: 0 });
  item.produto = {
    id: item.idProduto,
    nome: 'Dragão articulado',
    codigo: 4001,
  } as never;

  return Object.assign(new Consignacao(), {
    id: 1,
    status: StatusConsignacao.ABERTA,
    dataInclusao: new Date('2026-01-01T00:00:00.000Z'),
    percentualDesconto: parcial.revendedor?.percentualDesconto ?? 0,
    revendedor: criarRevendedorConsignacao(),
    itens: [item],
    ...parcial,
  });
}

function criarRevendedorConsignacao(
  parcial: Partial<Revendedor> = {},
): Revendedor {
  return Object.assign(new Revendedor(), {
    id: 3,
    nome: 'Loja Centro 3D',
    telefone: '(11) 99999-9999',
    status: StatusRevendedor.ATIVO,
    percentualDesconto: 0,
    dataInclusao: new Date('2026-01-01T00:00:00.000Z'),
    consignacoes: [],
    ...parcial,
  });
}

function criarConsignacaoComItens(
  itens: ItemConsignacao[],
  parcial: Partial<Consignacao> = {},
): Consignacao {
  return Object.assign(new Consignacao(), {
    id: 1,
    idRevendedor: 3,
    status: StatusConsignacao.ABERTA,
    dataInclusao: new Date('2026-01-01T00:00:00.000Z'),
    percentualDesconto: parcial.revendedor?.percentualDesconto ?? 0,
    revendedor: criarRevendedorConsignacao(),
    itens,
    ...parcial,
  });
}
