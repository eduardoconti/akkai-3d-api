import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Orcamento, StatusOrcamento, TipoOrcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { MovimentacaoEstoque } from '@produto/entities';
import { TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { FinalizarOrcamentoUseCase } from './finalizar-orcamento.use-case';

describe('FinalizarOrcamentoUseCase', () => {
  let useCase: FinalizarOrcamentoUseCase;
  let buscarOrcamentoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<Orcamento | null>
  >;
  let inserirVendaFinalizandoOrcamentoMock: jest.MockedFunction<
    (
      venda: Venda,
      movimentacoes: MovimentacaoEstoque[],
      orcamento: Orcamento,
    ) => Promise<Venda>
  >;

  beforeEach(() => {
    buscarOrcamentoPorIdMock = jest.fn();
    inserirVendaFinalizandoOrcamentoMock = jest.fn();

    const orcamentoService = {
      buscarPorId: buscarOrcamentoPorIdMock,
    } as unknown as OrcamentoService;

    const vendaService = {
      inserirVendaFinalizandoOrcamento: inserirVendaFinalizandoOrcamentoMock,
    } as unknown as VendaService;

    useCase = new FinalizarOrcamentoUseCase(orcamentoService, vendaService);
  });

  it('deve finalizar orçamento com venda na mesma transação', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 5,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.APROVADO,
    });
    const venda = Object.assign(new Venda(), { idOrcamento: 5 });
    const movimentacoesEstoque: MovimentacaoEstoque[] = [];
    const vendaPersistida = Object.assign(new Venda(), { id: 10 });

    buscarOrcamentoPorIdMock.mockResolvedValue(orcamento);
    inserirVendaFinalizandoOrcamentoMock.mockResolvedValue(vendaPersistida);

    const result = await useCase.execute({
      idOrcamento: 5,
      tipo: TipoVenda.LOJA,
      venda,
      movimentacoesEstoque,
    });

    expect(buscarOrcamentoPorIdMock).toHaveBeenCalledWith(5);
    expect(inserirVendaFinalizandoOrcamentoMock).toHaveBeenCalledWith(
      venda,
      movimentacoesEstoque,
      orcamento,
    );
    expect(result).toBe(vendaPersistida);
  });

  it('deve lançar NotFoundException quando orçamento não existir', async () => {
    buscarOrcamentoPorIdMock.mockResolvedValue(null);

    await expect(
      useCase.execute({
        idOrcamento: 99,
        tipo: TipoVenda.LOJA,
        venda: new Venda(),
        movimentacoesEstoque: [],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(inserirVendaFinalizandoOrcamentoMock).not.toHaveBeenCalled();
  });

  it('deve impedir finalizar orçamento já finalizado', async () => {
    buscarOrcamentoPorIdMock.mockResolvedValue(
      Object.assign(new Orcamento(), {
        id: 5,
        tipo: TipoOrcamento.LOJA,
        status: StatusOrcamento.FINALIZADO,
      }),
    );

    await expect(
      useCase.execute({
        idOrcamento: 5,
        tipo: TipoVenda.LOJA,
        venda: new Venda(),
        movimentacoesEstoque: [],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(inserirVendaFinalizandoOrcamentoMock).not.toHaveBeenCalled();
  });

  it('deve impedir finalizar com tipo de venda diferente do orçamento', async () => {
    buscarOrcamentoPorIdMock.mockResolvedValue(
      Object.assign(new Orcamento(), {
        id: 5,
        tipo: TipoOrcamento.ONLINE,
        status: StatusOrcamento.APROVADO,
      }),
    );

    await expect(
      useCase.execute({
        idOrcamento: 5,
        tipo: TipoVenda.LOJA,
        venda: new Venda(),
        movimentacoesEstoque: [],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(inserirVendaFinalizandoOrcamentoMock).not.toHaveBeenCalled();
  });

  it('deve impedir finalizar orçamento de feira com outra feira', async () => {
    buscarOrcamentoPorIdMock.mockResolvedValue(
      Object.assign(new Orcamento(), {
        id: 5,
        tipo: TipoOrcamento.FEIRA,
        idFeira: 3,
        status: StatusOrcamento.APROVADO,
      }),
    );

    await expect(
      useCase.execute({
        idOrcamento: 5,
        tipo: TipoVenda.FEIRA,
        idFeira: 4,
        venda: new Venda(),
        movimentacoesEstoque: [],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(inserirVendaFinalizandoOrcamentoMock).not.toHaveBeenCalled();
  });
});
