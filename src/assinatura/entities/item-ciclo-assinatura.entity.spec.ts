import {
  ItemCicloAssinatura,
  ItemCicloAssinaturaInput,
} from '@assinatura/entities';

describe('ItemCicloAssinatura', () => {
  describe('criar', () => {
    it('deve criar item com todos os campos', () => {
      const input: ItemCicloAssinaturaInput = {
        idProduto: 1,
        quantidade: 2,
        observacao: 'Cuidado frágil',
      };

      const item = ItemCicloAssinatura.criar(input);

      expect(item.idProduto).toBe(1);
      expect(item.quantidade).toBe(2);
      expect(item.observacao).toBe('Cuidado frágil');
    });

    it('deve criar item sem observação', () => {
      const item = ItemCicloAssinatura.criar({ idProduto: 2, quantidade: 1 });

      expect(item.idProduto).toBe(2);
      expect(item.quantidade).toBe(1);
      expect(item.observacao).toBeUndefined();
    });
  });
});
