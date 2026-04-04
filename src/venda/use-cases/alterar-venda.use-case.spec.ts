import { NotFoundException } from '@nestjs/common';
import { FinanceiroService } from '@financeiro/services';
import {
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';
import { AlterarVendaUseCase, ExecutarAlterarVendaInput } from '@venda/use-cases';

describe('AlterarVendaUseCase', () => {
  let useCase: AlterarVendaUseCase;
  let alterarVendaMock: jest.Mock;
  let garantirExisteVendaMock: jest.Mock;
  let garantirExisteFeiraMock: jest.Mock;
  let garantirExisteCarteiraMock: jest.Mock;
  let garantirExisteProdutoMock: jest.Mock;

  beforeEach(() => {
    alterarVendaMock = jest.fn();
    garantirExisteVendaMock = jest.fn();
    garantirExisteFeiraMock = jest.fn();
    garantirExisteCarteiraMock = jest.fn();
    garantirExisteProdutoMock = jest.fn();

    const vendaService = {
      alterarVenda: alterarVendaMock,
      garantirExisteVenda: garantirExisteVendaMock,
    } as unknown as VendaService;
    const feiraService = {
      garantirExisteFeira: garantirExisteFeiraMock,
    } as unknown as FeiraService;
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
    } as unknown as ProdutoService;
    const financeiroService = {
      garantirExisteCarteira: garantirExisteCarteiraMock,
    } as unknown as FinanceiroService;

    useCase = new AlterarVendaUseCase(
      vendaService,
      feiraService,
      produtoService,
      financeiroService,
    );
  });

  it('deve alterar venda recriando itens e movimentos da própria venda', async () => {
    const vendaExistente = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      desconto: 0,
      itens: [
        {
          idProduto: 10,
          nomeProduto: 'Produto antigo',
          quantidade: 2,
          valorUnitario: 1000,
        },
      ],
    });
    vendaExistente.id = 5;

    const input: ExecutarAlterarVendaInput = {
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.FEIRA,
      idCarteira: 2,
      idFeira: 3,
      desconto: 200,
      itens: [{ idProduto: 20, quantidade: 1 }],
    };

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirExisteCarteiraMock.mockResolvedValue(undefined);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 20,
        nome: 'Produto novo',
        valor: 2500,
      }),
    );
    alterarVendaMock.mockResolvedValue(vendaExistente);

    const result = await useCase.execute(5, input);

    expect(garantirExisteVendaMock).toHaveBeenCalledWith(5);
    expect(garantirExisteCarteiraMock).toHaveBeenCalledWith(2);
    expect(garantirExisteFeiraMock).toHaveBeenCalledWith(3);
    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        tipo: TipoVenda.FEIRA,
        meioPagamento: MeioPagamento.PIX,
        idCarteira: 2,
        idFeira: 3,
        desconto: 200,
        valorTotal: 2300,
      }),
      [
        expect.objectContaining({
          idProduto: 20,
          quantidade: 1,
          tipo: TipoMovimentacaoEstoque.SAIDA,
        }),
      ],
    );
    expect(result).toBe(vendaExistente);
  });

  it('deve lançar erro quando venda não existir', async () => {
    garantirExisteVendaMock.mockRejectedValue(
      new NotFoundException('Venda com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute(99, {
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.LOJA,
        idCarteira: 1,
        itens: [{ idProduto: 1, quantidade: 1 }],
      }),
    ).rejects.toThrow('Venda com ID 99 não encontrada.');
  });
});
