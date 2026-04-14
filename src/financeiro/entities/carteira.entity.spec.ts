import { MeioPagamento } from '@venda/entities/meio-pagamento.enum';
import { Carteira } from './carteira.entity';

describe('Carteira', () => {
  describe('aceitaMeioPagamento', () => {
    it('deve aceitar qualquer meio de pagamento quando a lista está vazia', () => {
      const carteira = new Carteira();
      carteira.meiosPagamento = [];

      expect(carteira.aceitaMeioPagamento(MeioPagamento.PIX)).toBe(true);
      expect(carteira.aceitaMeioPagamento(MeioPagamento.DIN)).toBe(true);
    });

    it('deve aceitar um meio de pagamento que está na lista', () => {
      const carteira = new Carteira();
      carteira.meiosPagamento = [MeioPagamento.PIX, MeioPagamento.DIN];

      expect(carteira.aceitaMeioPagamento(MeioPagamento.PIX)).toBe(true);
    });

    it('deve rejeitar um meio de pagamento que não está na lista', () => {
      const carteira = new Carteira();
      carteira.meiosPagamento = [MeioPagamento.DIN];

      expect(carteira.aceitaMeioPagamento(MeioPagamento.PIX)).toBe(false);
    });
  });
});
