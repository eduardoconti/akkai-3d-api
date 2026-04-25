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

    it('deve criar kit sem itens quando itens não informado', () => {
      const kit = KitMensal.criar({ ...input, itens: undefined });

      expect(kit.itens).toHaveLength(0);
    });

    it('deve criar kit com campos de vitrine', () => {
      const kit = KitMensal.criar({
        ...input,
        titulo: 'Kit Dinossauros',
        descricao: 'Descrição do kit',
        chamada: 'Chamada de ação',
        ativo: true,
        itensVitrine: ['🦕 T-Rex', '🦴 Mini colecionável'],
      });

      expect(kit.titulo).toBe('Kit Dinossauros');
      expect(kit.ativo).toBe(true);
      expect(kit.itensVitrine).toHaveLength(2);
    });
  });

  describe('atualizarVitrine', () => {
    it('deve atualizar campos de vitrine', () => {
      const kit = KitMensal.criar(input);

      kit.atualizarVitrine({
        titulo: 'Novo título',
        ativo: true,
        itensVitrine: ['Item A'],
      });

      expect(kit.titulo).toBe('Novo título');
      expect(kit.ativo).toBe(true);
      expect(kit.itensVitrine).toEqual(['Item A']);
    });

    it('deve não alterar campos não informados', () => {
      const kit = KitMensal.criar({
        ...input,
        titulo: 'Título original',
        ativo: false,
      });

      kit.atualizarVitrine({ descricao: 'Nova descrição' });

      expect(kit.titulo).toBe('Título original');
      expect(kit.ativo).toBe(false);
      expect(kit.descricao).toBe('Nova descrição');
    });

    it('deve não alterar dataInclusao', () => {
      const kit = KitMensal.criar(input);
      const dataOriginal = kit.dataInclusao;

      kit.atualizarVitrine({ titulo: 'Qualquer' });

      expect(kit.dataInclusao).toBe(dataOriginal);
    });
  });
});
