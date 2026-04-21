import { KitMensal, KitMensalInput } from '@assinatura/entities';

describe('KitMensal', () => {
  const input: KitMensalInput = {
    idPlano: 1,
    mesReferencia: 4,
    anoReferencia: 2026,
    itens: [{ idProduto: 1, quantidade: 2 }],
  };

  describe('criar', () => {
    it('deve criar kit com os dados fornecidos e itens mapeados', () => {
      const kit = KitMensal.criar(input);

      expect(kit.idPlano).toBe(1);
      expect(kit.mesReferencia).toBe(4);
      expect(kit.anoReferencia).toBe(2026);
      expect(kit.itens).toHaveLength(1);
      const [primeiroItem] = kit.itens;
      expect(primeiroItem!.idProduto).toBe(1);
      expect(primeiroItem!.quantidade).toBe(2);
      expect(kit.dataInclusao).toBeInstanceOf(Date);
    });

    it('deve criar kit com múltiplos itens', () => {
      const kit = KitMensal.criar({
        ...input,
        itens: [
          { idProduto: 1, quantidade: 1 },
          { idProduto: 2, quantidade: 2 },
          { idProduto: 3, quantidade: 1 },
        ],
      });

      expect(kit.itens).toHaveLength(3);
    });

    it('deve criar kit com lista de itens vazia', () => {
      const kit = KitMensal.criar({ ...input, itens: [] });

      expect(kit.itens).toHaveLength(0);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar os itens do kit', () => {
      const kit = KitMensal.criar(input);

      kit.atualizar({
        ...input,
        itens: [
          { idProduto: 3, quantidade: 1 },
          { idProduto: 2, quantidade: 2, observacao: 'Obs' },
        ],
      });

      expect(kit.itens).toHaveLength(2);
      const [vaso, almofada] = kit.itens;
      expect(vaso!.idProduto).toBe(3);
      expect(almofada!.observacao).toBe('Obs');
    });

    it('deve limpar a relação plano ao atualizar', () => {
      const kit = KitMensal.criar(input);

      kit.atualizar(input);

      expect(kit.plano).toBeUndefined();
    });

    it('deve não alterar dataInclusao ao atualizar', () => {
      const kit = KitMensal.criar(input);
      const dataOriginal = kit.dataInclusao;

      kit.atualizar({ ...input, itens: [] });

      expect(kit.dataInclusao).toBe(dataOriginal);
    });
  });
});
