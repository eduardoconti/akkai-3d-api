import { PlanoAssinatura, PlanoAssinaturaInput } from '@assinatura/entities';

describe('PlanoAssinatura', () => {
  const input: PlanoAssinaturaInput = {
    nome: 'Plano Básico',
    descricao: 'Plano mensal de entrada',
    valor: 4990,
    ativo: true,
  };

  describe('criar', () => {
    it('deve criar plano com os dados fornecidos', () => {
      const plano = PlanoAssinatura.criar(input);

      expect(plano.nome).toBe('Plano Básico');
      expect(plano.descricao).toBe('Plano mensal de entrada');
      expect(plano.valor).toBe(4990);
      expect(plano.ativo).toBe(true);
      expect(plano.dataInclusao).toBeInstanceOf(Date);
    });

    it('deve criar plano sem campos opcionais', () => {
      const plano = PlanoAssinatura.criar({ nome: 'Básico', valor: 2990, ativo: true });

      expect(plano.descricao).toBeUndefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar todos os campos do plano', () => {
      const plano = PlanoAssinatura.criar(input);

      plano.atualizar({ nome: 'Plano Premium', descricao: 'Novo desc', valor: 9990, ativo: false });

      expect(plano.nome).toBe('Plano Premium');
      expect(plano.descricao).toBe('Novo desc');
      expect(plano.valor).toBe(9990);
      expect(plano.ativo).toBe(false);
    });

    it('deve não alterar dataInclusao ao atualizar', () => {
      const plano = PlanoAssinatura.criar(input);
      const dataOriginal = plano.dataInclusao;

      plano.atualizar({ ...input, nome: 'Outro Nome' });

      expect(plano.dataInclusao).toBe(dataOriginal);
    });
  });
});
