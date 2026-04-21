import {
  CicloAssinatura,
  CicloAssinaturaInput,
  StatusCiclo,
} from '@assinatura/entities';

describe('CicloAssinatura', () => {
  const input: CicloAssinaturaInput = {
    idAssinante: 1,
    mesReferencia: 4,
    anoReferencia: 2026,
    status: StatusCiclo.PENDENTE,
    itens: [{ idProduto: 1, quantidade: 1 }],
  };

  describe('criar', () => {
    it('deve criar ciclo com itens mapeados', () => {
      const ciclo = CicloAssinatura.criar(input);

      expect(ciclo.idAssinante).toBe(1);
      expect(ciclo.mesReferencia).toBe(4);
      expect(ciclo.anoReferencia).toBe(2026);
      expect(ciclo.status).toBe(StatusCiclo.PENDENTE);
      expect(ciclo.itens).toHaveLength(1);
      const [primeiroItem] = ciclo.itens;
      expect(primeiroItem!.idProduto).toBe(1);
      expect(primeiroItem!.quantidade).toBe(1);
      expect(ciclo.dataInclusao).toBeInstanceOf(Date);
    });

    it('deve criar ciclo com múltiplos itens', () => {
      const ciclo = CicloAssinatura.criar({
        ...input,
        itens: [
          { idProduto: 1, quantidade: 1 },
          { idProduto: 2, quantidade: 2 },
        ],
      });

      expect(ciclo.itens).toHaveLength(2);
    });

    it('deve criar ciclo sem campos opcionais', () => {
      const ciclo = CicloAssinatura.criar({
        ...input,
        codigoRastreio: undefined,
        dataEnvio: undefined,
        observacao: undefined,
      });

      expect(ciclo.codigoRastreio).toBeUndefined();
      expect(ciclo.dataEnvio).toBeUndefined();
      expect(ciclo.observacao).toBeUndefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar o status e itens do ciclo', () => {
      const ciclo = CicloAssinatura.criar(input);

      ciclo.atualizar({
        ...input,
        status: StatusCiclo.ENVIADO,
        codigoRastreio: 'BR123456789',
        itens: [{ idProduto: 2, quantidade: 3, observacao: 'Obs' }],
      });

      expect(ciclo.status).toBe(StatusCiclo.ENVIADO);
      expect(ciclo.codigoRastreio).toBe('BR123456789');
      const [item] = ciclo.itens;
      expect(item!.idProduto).toBe(2);
      expect(item!.quantidade).toBe(3);
    });

    it('deve limpar a relação assinante ao atualizar', () => {
      const ciclo = CicloAssinatura.criar(input);

      ciclo.atualizar(input);

      expect(ciclo.assinante).toBeUndefined();
    });
  });
});
