import { NotFoundException } from '@nestjs/common';
import { CarteiraService } from '@financeiro/services';
import { Produto, TipoMovimentacaoEstoque } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { MeioPagamento, TipoVenda, Venda } from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';
import {
  AlterarVendaUseCase,
  ExecutarAlterarVendaInput,
} from '@venda/use-cases';
import { CurrentUserContext } from '../../common/services/current-user-context.service';

describe('AlterarVendaUseCase', () => {
  let useCase: AlterarVendaUseCase;
  let alterarVendaMock: jest.Mock;
  let garantirExisteVendaMock: jest.Mock;
  let garantirExisteFeiraMock: jest.Mock;
  let garantirCarteiraAceitaMeioPagamentoMock: jest.Mock;
  let garantirExisteProdutoMock: jest.Mock;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    alterarVendaMock = jest.fn();
    garantirExisteVendaMock = jest.fn();
    garantirExisteFeiraMock = jest.fn();
    garantirCarteiraAceitaMeioPagamentoMock = jest.fn();
    garantirExisteProdutoMock = jest.fn();
    currentUserContext = { usuarioId: 7 };

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
    const carteiraService = {
      garantirCarteiraAceitaMeioPagamento:
        garantirCarteiraAceitaMeioPagamentoMock,
    } as unknown as CarteiraService;

    useCase = new AlterarVendaUseCase(
      vendaService,
      feiraService,
      produtoService,
      carteiraService,
      currentUserContext as CurrentUserContext,
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
      id: 5,
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.FEIRA,
      idCarteira: 2,
      idFeira: 3,
      desconto: 200,
      itens: [{ idProduto: 20, quantidade: 1 }],
    };

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    garantirExisteFeiraMock.mockResolvedValue(undefined);
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), {
        id: 20,
        nome: 'Produto novo',
        valor: 2500,
      }),
    );
    alterarVendaMock.mockResolvedValue(vendaExistente);

    const result = await useCase.execute(input);

    expect(garantirExisteVendaMock).toHaveBeenCalledWith(5);
    expect(garantirCarteiraAceitaMeioPagamentoMock).toHaveBeenCalledWith(
      2,
      MeioPagamento.PIX,
    );
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
          idUsuarioInclusao: 7,
        }),
      ],
    );
    expect(result).toBe(vendaExistente);
  });

  it('deve alterar venda com item avulso sem movimentar estoque', async () => {
    const vendaExistente = Venda.criar({
      meioPagamento: MeioPagamento.DIN,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [],
    });
    vendaExistente.id = 6;

    garantirExisteVendaMock.mockResolvedValue(vendaExistente);
    garantirCarteiraAceitaMeioPagamentoMock.mockResolvedValue(undefined);
    alterarVendaMock.mockResolvedValue(vendaExistente);

    await useCase.execute({
      id: 6,
      meioPagamento: MeioPagamento.PIX,
      tipo: TipoVenda.LOJA,
      idCarteira: 1,
      itens: [
        { nomeProduto: 'Peça avulsa', valorUnitario: 3000, quantidade: 1 },
      ],
    });

    expect(garantirExisteProdutoMock).not.toHaveBeenCalled();
    expect(alterarVendaMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 6 }),
      [],
    );
  });

  it('deve lançar erro quando venda não existir', async () => {
    garantirExisteVendaMock.mockRejectedValue(
      new NotFoundException('Venda com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        id: 99,
        meioPagamento: MeioPagamento.PIX,
        tipo: TipoVenda.LOJA,
        idCarteira: 1,
        itens: [{ idProduto: 1, quantidade: 1 }],
      }),
    ).rejects.toThrow('Venda com ID 99 não encontrada.');
  });
});
