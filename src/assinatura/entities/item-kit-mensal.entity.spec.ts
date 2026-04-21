import { ItemKitMensal, ItemKitMensalInput } from '@assinatura/entities';

describe('ItemKitMensal', () => {
  describe('criar', () => {
    it('deve criar item com todos os campos', () => {
      const input: ItemKitMensalInput = {
        idProduto: 3,
        quantidade: 3,
        observacao: 'Tamanho G',
      };

      const item = ItemKitMensal.criar(input);

      expect(item.idProduto).toBe(3);
      expect(item.quantidade).toBe(3);
      expect(item.observacao).toBe('Tamanho G');
    });

    it('deve criar item sem observação', () => {
      const item = ItemKitMensal.criar({ idProduto: 1, quantidade: 1 });

      expect(item.idProduto).toBe(1);
      expect(item.quantidade).toBe(1);
      expect(item.observacao).toBeUndefined();
    });
  });
});
