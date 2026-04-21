import { ItemKitMensal, ItemKitMensalInput } from '@assinatura/entities';

describe('ItemKitMensal', () => {
  describe('criar', () => {
    it('deve criar item com todos os campos', () => {
      const input: ItemKitMensalInput = {
        nomeProduto: 'Almofada',
        quantidade: 3,
        observacao: 'Tamanho G',
      };

      const item = ItemKitMensal.criar(input);

      expect(item.nomeProduto).toBe('Almofada');
      expect(item.quantidade).toBe(3);
      expect(item.observacao).toBe('Tamanho G');
    });

    it('deve criar item sem observação', () => {
      const item = ItemKitMensal.criar({ nomeProduto: 'Caneca', quantidade: 1 });

      expect(item.nomeProduto).toBe('Caneca');
      expect(item.quantidade).toBe(1);
      expect(item.observacao).toBeUndefined();
    });
  });
});
