import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  Consignacao,
  ItemConsignacao,
  StatusConsignacao,
  StatusRevendedor,
} from '@consignacao/entities';
import {
  OrigemMovimentacaoEstoque,
  MovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ConsignacaoService } from './consignacao.service';

type GerenciadorTransacaoTeste = {
  save: jest.Mock;
};

type CallbackTransacaoTeste = (manager: GerenciadorTransacaoTeste) => unknown;

describe('ConsignacaoService', () => {
  let service: ConsignacaoService;
  let consignacaoRepository: { findOne: jest.Mock };
  let itemConsignacaoRepository: {
    findOne: jest.Mock;
  };
  let dataSource: {
    transaction: jest.Mock<Promise<unknown>, [CallbackTransacaoTeste]>;
  };

  beforeEach(() => {
    consignacaoRepository = { findOne: jest.fn() };
    itemConsignacaoRepository = {
      findOne: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((callback: CallbackTransacaoTeste) =>
        Promise.resolve(callback({ save: jest.fn() })),
      ),
    };

    service = new ConsignacaoService(
      consignacaoRepository as unknown as Repository<Consignacao>,
      itemConsignacaoRepository as unknown as Repository<ItemConsignacao>,
      dataSource as unknown as DataSource,
    );
  });

  it('deve registrar vendas em lote quando houver saldo disponível', async () => {
    const manager = { save: jest.fn() };
    const consignacao = criarConsignacaoComItens([
      criarItemConsignacao({ id: 2, idProduto: 10, quantidadeEnviada: 5 }),
      criarItemConsignacao({ id: 3, idProduto: 20, quantidadeEnviada: 4 }),
    ]);

    dataSource.transaction.mockImplementation((callback) =>
      Promise.resolve(callback(manager)),
    );
    consignacaoRepository.findOne
      .mockResolvedValueOnce(consignacao)
      .mockResolvedValueOnce(criarConsignacaoDetalhe());

    await service.registrarVendas(1, [
      { idProduto: 10, quantidade: 2 },
      { idProduto: 20, quantidade: 3 },
    ]);

    expect(manager.save).toHaveBeenCalledWith(
      ItemConsignacao,
      expect.arrayContaining([
        expect.objectContaining({
          idProduto: 10,
          quantidadeVendida: 2,
        }),
        expect.objectContaining({
          idProduto: 20,
          quantidadeVendida: 3,
        }),
      ]),
    );
  });

  it('deve impedir vendas em lote com produto repetido', async () => {
    await expect(
      service.registrarVendas(1, [
        { idProduto: 10, quantidade: 1 },
        { idProduto: 10, quantidade: 2 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(consignacaoRepository.findOne).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve impedir vendas em lote acima do saldo disponível', async () => {
    consignacaoRepository.findOne.mockResolvedValue(
      criarConsignacaoComItens([
        criarItemConsignacao({
          idProduto: 10,
          quantidadeEnviada: 5,
          quantidadeVendida: 4,
        }),
      ]),
    );

    await expect(
      service.registrarVendas(1, [{ idProduto: 10, quantidade: 2 }]),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve registrar devolução e gerar entrada de estoque', async () => {
    const manager = { save: jest.fn() };
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
});

function criarItemConsignacao(
  parcial: Partial<ItemConsignacao> = {},
): ItemConsignacao {
  return Object.assign(new ItemConsignacao(), {
    id: 2,
    idConsignacao: 1,
    idProduto: 10,
    quantidadeEnviada: 5,
    quantidadeVendida: 0,
    quantidadeDevolvida: 0,
    consignacao: {
      id: 1,
      status: StatusConsignacao.ABERTA,
    },
    ...parcial,
  });
}

function criarConsignacaoDetalhe(): Consignacao {
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
    revendedor: {
      id: 3,
      nome: 'Loja Centro 3D',
      telefone: '(11) 99999-9999',
      status: StatusRevendedor.ATIVO,
    },
    itens: [item],
  });
}

function criarConsignacaoComItens(itens: ItemConsignacao[]): Consignacao {
  return Object.assign(new Consignacao(), {
    id: 1,
    status: StatusConsignacao.ABERTA,
    itens,
  });
}
