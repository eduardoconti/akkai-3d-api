import {
  Assinante,
  AssinanteInput,
  StatusAssinante,
} from '@assinatura/entities';

describe('Assinante', () => {
  const input: AssinanteInput = {
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '11999999999',
    enderecoEntrega: 'Rua A, 100',
    idPlano: 1,
    status: StatusAssinante.ATIVO,
  };

  describe('criar', () => {
    it('deve criar assinante com os dados fornecidos', () => {
      const assinante = Assinante.criar(input);

      expect(assinante.nome).toBe('João Silva');
      expect(assinante.email).toBe('joao@email.com');
      expect(assinante.telefone).toBe('11999999999');
      expect(assinante.enderecoEntrega).toBe('Rua A, 100');
      expect(assinante.idPlano).toBe(1);
      expect(assinante.status).toBe(StatusAssinante.ATIVO);
      expect(assinante.dataInclusao).toBeInstanceOf(Date);
    });

    it('deve criar assinante sem campos opcionais', () => {
      const assinante = Assinante.criar({
        nome: 'Maria',
        idPlano: 2,
        status: StatusAssinante.PAUSADO,
      });

      expect(assinante.email).toBeUndefined();
      expect(assinante.telefone).toBeUndefined();
      expect(assinante.enderecoEntrega).toBeUndefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar os campos do assinante', () => {
      const assinante = Assinante.criar(input);

      assinante.atualizar({
        ...input,
        nome: 'Maria Souza',
        status: StatusAssinante.CANCELADO,
      });

      expect(assinante.nome).toBe('Maria Souza');
      expect(assinante.status).toBe(StatusAssinante.CANCELADO);
    });

    it('deve limpar a relação plano ao atualizar', () => {
      const assinante = Assinante.criar(input);

      assinante.atualizar(input);

      expect(assinante.plano).toBeUndefined();
    });

    it('deve não alterar dataInclusao ao atualizar', () => {
      const assinante = Assinante.criar(input);
      const dataOriginal = assinante.dataInclusao;

      assinante.atualizar({ ...input, nome: 'Outro Nome' });

      expect(assinante.dataInclusao).toBe(dataOriginal);
    });
  });
});
