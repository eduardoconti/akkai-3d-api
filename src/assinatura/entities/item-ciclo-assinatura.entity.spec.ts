import {
  ItemCicloAssinatura,
  ItemCicloAssinaturaInput,
} from '@assinatura/entities';

describe('ItemCicloAssinatura', () => {
  describe('criar', () => {
    it('deve criar item com todos os campos', () => {
      const input: ItemCicloAssinaturaInput = {
        nomeProduto: 'Caneca',
        quantidade: 2,
        observacao: 'Cuidado frágil',
      };

      const item = ItemCicloAssinatura.criar(input);

      expect(item.nomeProduto).toBe('Caneca');
      expect(item.quantidade).toBe(2);
      expect(item.observacao).toBe('Cuidado frágil');
    });

    it('deve criar item sem observação', () => {
      const item = ItemCicloAssinatura.criar({ nomeProduto: 'Vaso', quantidade: 1 });

      expect(item.nomeProduto).toBe('Vaso');
      expect(item.quantidade).toBe(1);
      expect(item.observacao).toBeUndefined();
    });
  });
});
