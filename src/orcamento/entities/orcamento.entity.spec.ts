import { BadRequestException } from '@nestjs/common';
import {
  ItemOrcamento,
  Orcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';

describe('Orcamento', () => {
  it('deve finalizar orçamento válido', () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 5,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.APROVADO,
    });

    orcamento.finalizar();

    expect(orcamento.status).toBe(StatusOrcamento.FINALIZADO);
  });

  it('deve impedir finalizar orçamento já finalizado', () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 5,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.FINALIZADO,
    });

    expect(() => orcamento.finalizar()).toThrow(BadRequestException);
  });

  describe('definirItens', () => {
    const orcamentoEm = (status: StatusOrcamento) =>
      Object.assign(new Orcamento(), {
        id: 5,
        tipo: TipoOrcamento.LOJA,
        status,
      });

    it('deve substituir os produtos do orçamento', () => {
      const orcamento = orcamentoEm(StatusOrcamento.PENDENTE);
      orcamento.itens = [
        ItemOrcamento.criar({
          idProduto: 1,
          nomeProduto: 'Antigo',
          quantidade: 1,
        }),
      ];

      orcamento.definirItens([
        { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 2 },
        { idProduto: 11, nomeProduto: 'Vaso', quantidade: 1 },
      ]);

      expect(orcamento.itens).toHaveLength(2);
      expect(orcamento.itens?.[0]).toMatchObject({
        idProduto: 10,
        nomeProduto: 'Chaveiro',
        quantidade: 2,
      });
    });

    it('deve aceitar uma lista vazia para remover os produtos', () => {
      const orcamento = orcamentoEm(StatusOrcamento.PENDENTE);

      orcamento.definirItens([]);

      expect(orcamento.itens).toEqual([]);
    });

    it('deve impedir alterar produtos de orçamento finalizado', () => {
      const orcamento = orcamentoEm(StatusOrcamento.FINALIZADO);

      expect(() =>
        orcamento.definirItens([
          { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 1 },
        ]),
      ).toThrow(BadRequestException);
    });

    it('deve impedir o mesmo produto duas vezes', () => {
      const orcamento = orcamentoEm(StatusOrcamento.PENDENTE);

      expect(() =>
        orcamento.definirItens([
          { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 1 },
          { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 2 },
        ]),
      ).toThrow(BadRequestException);
    });
  });
});
