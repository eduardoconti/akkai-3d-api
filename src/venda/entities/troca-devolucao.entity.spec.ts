import { BadRequestException } from '@nestjs/common';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import {
  TipoDiferencaTrocaDevolucao,
  TipoItemTrocaDevolucao,
  TrocaDevolucao,
} from '@venda/entities';

describe('TrocaDevolucao', () => {
  const dataTrocaDevolucao = '2026-06-22T10:00:00.000Z';

  it('deve calcular diferença a pagar quando valor novo for maior', () => {
    const trocaDevolucao = TrocaDevolucao.criar({
      dataTrocaDevolucao,
      idCarteira: 1,
      meioPagamento: MeioPagamento.PIX,
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
          valorUnitario: 1500,
        },
      ],
    });

    expect(trocaDevolucao.valorDevolvido).toBe(1000);
    expect(trocaDevolucao.valorNovo).toBe(1500);
    expect(trocaDevolucao.valorDiferenca).toBe(500);
    expect(trocaDevolucao.tipoDiferenca).toBe(
      TipoDiferencaTrocaDevolucao.A_PAGAR,
    );
  });

  it('deve calcular diferença a devolver quando valor devolvido for maior', () => {
    const trocaDevolucao = TrocaDevolucao.criar({
      dataTrocaDevolucao,
      idCarteira: 1,
      meioPagamento: MeioPagamento.DIN,
      idUsuarioInclusao: 7,
      itens: [
        {
          idProduto: 1,
          tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
          quantidade: 2,
          valorUnitario: 1000,
        },
        {
          idProduto: 2,
          tipo: TipoItemTrocaDevolucao.ENTREGUE,
          quantidade: 1,
          valorUnitario: 1500,
        },
      ],
    });

    expect(trocaDevolucao.valorDevolvido).toBe(2000);
    expect(trocaDevolucao.valorNovo).toBe(1500);
    expect(trocaDevolucao.valorDiferenca).toBe(500);
    expect(trocaDevolucao.tipoDiferenca).toBe(
      TipoDiferencaTrocaDevolucao.A_DEVOLVER,
    );
  });

  it('deve rejeitar operação sem item devolvido', () => {
    expect(() =>
      TrocaDevolucao.criar({
        dataTrocaDevolucao,
        idCarteira: 1,
        meioPagamento: MeioPagamento.PIX,
        idUsuarioInclusao: 7,
        itens: [
          {
            idProduto: 2,
            tipo: TipoItemTrocaDevolucao.ENTREGUE,
            quantidade: 1,
            valorUnitario: 1500,
          },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('deve exigir carteira e meio de pagamento quando existe diferença', () => {
    expect(() =>
      TrocaDevolucao.criar({
        dataTrocaDevolucao,
        idUsuarioInclusao: 7,
        itens: [
          {
            idProduto: 1,
            tipo: TipoItemTrocaDevolucao.DEVOLVIDO,
            quantidade: 1,
            valorUnitario: 1000,
          },
        ],
      }),
    ).toThrow(BadRequestException);
  });
});
