import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CanalAtendimentoOrcamento,
  Orcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';
import {
  OrcamentoService,
  PrepararItensOrcamentoService,
} from '@orcamento/services';
import { AtualizarOrcamentoUseCase } from './atualizar-orcamento.use-case';

describe('AtualizarOrcamentoUseCase', () => {
  let useCase: AtualizarOrcamentoUseCase;
  let orcamentoService: {
    buscarComItens: jest.Mock;
    atualizarOrcamento: jest.Mock;
    atualizarOrcamentoSubstituindoItens: jest.Mock;
  };
  let prepararItens: { preparar: jest.Mock };

  beforeEach(() => {
    orcamentoService = {
      buscarComItens: jest.fn(),
      atualizarOrcamento: jest.fn(),
      atualizarOrcamentoSubstituindoItens: jest.fn(),
    };
    prepararItens = { preparar: jest.fn() };

    useCase = new AtualizarOrcamentoUseCase(
      orcamentoService as unknown as OrcamentoService,
      prepararItens as unknown as PrepararItensOrcamentoService,
    );
  });

  it('deve alterar canal de atendimento de orçamento online', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.ONLINE,
      canalAtendimento: CanalAtendimentoOrcamento.WPP,
    });
    orcamentoService.buscarComItens.mockResolvedValue(orcamento);
    orcamentoService.atualizarOrcamento.mockResolvedValue(orcamento);

    const result = await useCase.execute(1, {
      canalAtendimento: CanalAtendimentoOrcamento.INSTAGRAM,
    });

    expect(result.canalAtendimento).toBe(CanalAtendimentoOrcamento.INSTAGRAM);
    expect(orcamentoService.atualizarOrcamento).toHaveBeenCalledWith(orcamento);
  });

  it('deve limpar canal de atendimento quando orçamento deixar de ser online', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.ONLINE,
      canalAtendimento: CanalAtendimentoOrcamento.WPP,
    });
    orcamentoService.buscarComItens.mockResolvedValue(orcamento);
    orcamentoService.atualizarOrcamento.mockResolvedValue(orcamento);

    await useCase.execute(1, { tipo: TipoOrcamento.LOJA });

    expect(orcamento.canalAtendimento).toBeUndefined();
  });

  it('deve exigir canal de atendimento quando orçamento virar online', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
    });
    orcamentoService.buscarComItens.mockResolvedValue(orcamento);

    await expect(
      useCase.execute(1, { tipo: TipoOrcamento.ONLINE }),
    ).rejects.toThrow(BadRequestException);
    expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
  });

  it('deve permitir alteração direta para status finalizado sem venda', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.APROVADO,
    });
    orcamentoService.buscarComItens.mockResolvedValue(orcamento);

    await useCase.execute(1, { status: StatusOrcamento.FINALIZADO });

    expect(orcamento.status).toBe(StatusOrcamento.FINALIZADO);
    expect(orcamentoService.atualizarOrcamento).toHaveBeenCalledWith(orcamento);
  });

  it('deve impedir cancelar orçamento finalizado', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.FINALIZADO,
    });
    orcamentoService.buscarComItens.mockResolvedValue(orcamento);

    await expect(
      useCase.execute(1, { status: StatusOrcamento.CANCELADO }),
    ).rejects.toThrow(BadRequestException);
    expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando orçamento não existir', async () => {
    orcamentoService.buscarComItens.mockResolvedValue(null);

    await expect(useCase.execute(99, {})).rejects.toThrow(NotFoundException);
  });

  describe('produtos do orçamento', () => {
    const itensPreparados = [
      { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 2 },
    ];

    it('deve manter os produtos quando "itens" não é informado', async () => {
      const orcamento = Object.assign(new Orcamento(), {
        id: 1,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.PENDENTE,
      });
      orcamentoService.buscarComItens.mockResolvedValue(orcamento);
      orcamentoService.atualizarOrcamento.mockResolvedValue(orcamento);

      await useCase.execute(1, { descricao: 'novo texto' });

      expect(prepararItens.preparar).not.toHaveBeenCalled();
      expect(
        orcamentoService.atualizarOrcamentoSubstituindoItens,
      ).not.toHaveBeenCalled();
      expect(orcamentoService.atualizarOrcamento).toHaveBeenCalledWith(
        orcamento,
      );
    });

    it('deve substituir os produtos quando "itens" é informado', async () => {
      const orcamento = Object.assign(new Orcamento(), {
        id: 1,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.PENDENTE,
      });
      orcamentoService.buscarComItens.mockResolvedValue(orcamento);
      orcamentoService.atualizarOrcamentoSubstituindoItens.mockResolvedValue(
        orcamento,
      );
      prepararItens.preparar.mockResolvedValue(itensPreparados);

      await useCase.execute(1, { itens: [{ idProduto: 10, quantidade: 2 }] });

      expect(prepararItens.preparar).toHaveBeenCalledWith([
        { idProduto: 10, quantidade: 2 },
      ]);
      expect(orcamento.itens).toEqual([
        expect.objectContaining({ idProduto: 10, quantidade: 2 }),
      ]);
      expect(
        orcamentoService.atualizarOrcamentoSubstituindoItens,
      ).toHaveBeenCalledWith(orcamento);
      expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
    });

    it('deve remover todos os produtos quando "itens" é uma lista vazia', async () => {
      const orcamento = Object.assign(new Orcamento(), {
        id: 1,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.PENDENTE,
        itens: [{ idProduto: 10 }],
      });
      orcamentoService.buscarComItens.mockResolvedValue(orcamento);
      orcamentoService.atualizarOrcamentoSubstituindoItens.mockResolvedValue(
        orcamento,
      );
      prepararItens.preparar.mockResolvedValue([]);

      await useCase.execute(1, { itens: [] });

      expect(orcamento.itens).toEqual([]);
      expect(
        orcamentoService.atualizarOrcamentoSubstituindoItens,
      ).toHaveBeenCalled();
    });

    it('não deve alterar os produtos de orçamento finalizado', async () => {
      const orcamento = Object.assign(new Orcamento(), {
        id: 1,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.FINALIZADO,
      });
      orcamentoService.buscarComItens.mockResolvedValue(orcamento);
      prepararItens.preparar.mockResolvedValue(itensPreparados);

      await expect(
        useCase.execute(1, { itens: [{ idProduto: 10, quantidade: 2 }] }),
      ).rejects.toThrow(BadRequestException);
      expect(
        orcamentoService.atualizarOrcamentoSubstituindoItens,
      ).not.toHaveBeenCalled();
    });

    it('deve propagar o erro quando um produto não existe', async () => {
      const orcamento = Object.assign(new Orcamento(), {
        id: 1,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.PENDENTE,
      });
      orcamentoService.buscarComItens.mockResolvedValue(orcamento);
      prepararItens.preparar.mockRejectedValue(
        new NotFoundException('Produto com ID 99 não encontrado'),
      );

      await expect(
        useCase.execute(1, { itens: [{ idProduto: 99, quantidade: 1 }] }),
      ).rejects.toThrow(NotFoundException);
      expect(
        orcamentoService.atualizarOrcamentoSubstituindoItens,
      ).not.toHaveBeenCalled();
    });
  });
});
