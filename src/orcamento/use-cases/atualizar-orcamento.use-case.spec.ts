import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CanalAtendimentoOrcamento,
  Orcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { AtualizarOrcamentoUseCase } from './atualizar-orcamento.use-case';

describe('AtualizarOrcamentoUseCase', () => {
  let useCase: AtualizarOrcamentoUseCase;
  let orcamentoService: {
    buscarPorId: jest.Mock;
    atualizarOrcamento: jest.Mock;
  };

  beforeEach(() => {
    orcamentoService = {
      buscarPorId: jest.fn(),
      atualizarOrcamento: jest.fn(),
    };

    useCase = new AtualizarOrcamentoUseCase(
      orcamentoService as unknown as OrcamentoService,
    );
  });

  it('deve alterar canal de atendimento de orçamento online', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.ONLINE,
      canalAtendimento: CanalAtendimentoOrcamento.WPP,
    });
    orcamentoService.buscarPorId.mockResolvedValue(orcamento);
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
    orcamentoService.buscarPorId.mockResolvedValue(orcamento);
    orcamentoService.atualizarOrcamento.mockResolvedValue(orcamento);

    await useCase.execute(1, { tipo: TipoOrcamento.LOJA });

    expect(orcamento.canalAtendimento).toBeUndefined();
  });

  it('deve exigir canal de atendimento quando orçamento virar online', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
    });
    orcamentoService.buscarPorId.mockResolvedValue(orcamento);

    await expect(
      useCase.execute(1, { tipo: TipoOrcamento.ONLINE }),
    ).rejects.toThrow(BadRequestException);
    expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
  });

  it('deve impedir alteração direta para status finalizado', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.APROVADO,
    });
    orcamentoService.buscarPorId.mockResolvedValue(orcamento);

    await expect(
      useCase.execute(1, { status: StatusOrcamento.FINALIZADO }),
    ).rejects.toThrow(BadRequestException);
    expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
  });

  it('deve impedir cancelar orçamento finalizado', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.FINALIZADO,
    });
    orcamentoService.buscarPorId.mockResolvedValue(orcamento);

    await expect(
      useCase.execute(1, { status: StatusOrcamento.CANCELADO }),
    ).rejects.toThrow(BadRequestException);
    expect(orcamentoService.atualizarOrcamento).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando orçamento não existir', async () => {
    orcamentoService.buscarPorId.mockResolvedValue(null);

    await expect(useCase.execute(99, {})).rejects.toThrow(NotFoundException);
  });
});
