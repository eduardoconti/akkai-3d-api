import { InternalServerErrorException, Logger } from '@nestjs/common';
import { MovimentacaoEstoque } from '@produto/entities';
import {
  ItemTrocaDevolucao,
  TipoItemTrocaDevolucao,
  TrocaDevolucao,
} from '@venda/entities';
import { TrocaDevolucaoService } from '@venda/services';
import { DataSource } from 'typeorm';

describe('TrocaDevolucaoService', () => {
  let service: TrocaDevolucaoService;
  let saveMock: jest.Mock;
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: { save: jest.Mock };
  };
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    saveMock = jest.fn();
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: { save: saveMock },
    };

    service = new TrocaDevolucaoService({
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  function criarTrocaDevolucao(): TrocaDevolucao {
    return TrocaDevolucao.criar({
      dataTrocaDevolucao: '2026-06-22T10:00:00.000Z',
      idUsuarioInclusao: 7,
      itens: [
        {
          idProduto: 1,
          tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
          quantidade: 1,
          valorUnitario: 1000,
        },
        {
          idProduto: 2,
          tipo: TipoItemTrocaDevolucao.ENTREGUE,
          quantidade: 1,
          valorUnitario: 1000,
        },
      ],
    });
  }

  it('deve salvar a troca antes dos itens e preencher a FK dos itens', async () => {
    const trocaDevolucao = criarTrocaDevolucao();
    const snapshots: unknown[] = [];

    saveMock.mockImplementation((entidade: unknown) => {
      if (entidade instanceof TrocaDevolucao) {
        snapshots.push({
          tipo: 'troca',
          quantidadeItens: entidade.itens.length,
        });
        entidade.id = 33;
        return Promise.resolve(entidade);
      }

      if (
        Array.isArray(entidade) &&
        entidade.every((item) => item instanceof ItemTrocaDevolucao)
      ) {
        snapshots.push({
          tipo: 'itens',
          idsTrocaDevolucao: entidade.map((item) => item.idTrocaDevolucao),
        });
        return Promise.resolve(entidade);
      }

      snapshots.push({ tipo: 'movimentacoes' });
      return Promise.resolve(entidade);
    });

    const resultado = await service.inserirTrocaDevolucao(trocaDevolucao, [
      {} as MovimentacaoEstoque,
    ]);

    expect(resultado.id).toBe(33);
    expect(resultado.itens[0]?.idTrocaDevolucao).toBe(33);
    expect(resultado.itens[1]?.idTrocaDevolucao).toBe(33);
    expect(snapshots).toEqual([
      { tipo: 'troca', quantidadeItens: 0 },
      { tipo: 'itens', idsTrocaDevolucao: [33, 33] },
      { tipo: 'movimentacoes' },
    ]);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('deve desfazer a transação quando ocorrer erro ao salvar', async () => {
    const trocaDevolucao = criarTrocaDevolucao();
    saveMock.mockRejectedValueOnce(new Error('falha'));

    await expect(
      service.inserirTrocaDevolucao(trocaDevolucao, []),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});
