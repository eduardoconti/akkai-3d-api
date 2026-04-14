import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { CriarDespesaInput, Despesa, DespesaInput } from './despesa.entity';

describe('Despesa', () => {
  const input: CriarDespesaInput = {
    dataLancamento: '2024-06-15T10:00:00.000Z',
    descricao: '  Compra de materiais  ',
    valor: 15000,
    idCategoria: 3,
    meioPagamento: MeioPagamento.PIX,
    idCarteira: 1,
    observacao: '  Nota fiscal 123  ',
    idUsuarioInclusao: 7,
  };

  describe('criar', () => {
    it('deve criar uma despesa com os dados fornecidos', () => {
      const despesa = Despesa.criar(input);

      expect(despesa.idUsuarioInclusao).toBe(7);
      expect(despesa.dataLancamento).toEqual(new Date(input.dataLancamento));
      expect(despesa.descricao).toBe('Compra de materiais');
      expect(despesa.valor).toBe(input.valor);
      expect(despesa.idCategoria).toBe(input.idCategoria);
      expect(despesa.meioPagamento).toBe(MeioPagamento.PIX);
      expect(despesa.idCarteira).toBe(input.idCarteira);
      expect(despesa.observacao).toBe('Nota fiscal 123');
    });

    it('deve criar despesa sem observacao quando não informada', () => {
      const { observacao, ...semObservacao } = input;
      const despesa = Despesa.criar(semObservacao);

      expect(despesa.observacao).toBeUndefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar todos os campos da despesa', () => {
      const despesa = Despesa.criar(input);
      const novoInput: DespesaInput = {
        dataLancamento: '2024-07-20T08:00:00.000Z',
        descricao: 'Fornecedor externo',
        valor: 5000,
        idCategoria: 5,
        meioPagamento: MeioPagamento.DIN,
        idCarteira: 2,
      };

      despesa.atualizar(novoInput);

      expect(despesa.dataLancamento).toEqual(
        new Date(novoInput.dataLancamento),
      );
      expect(despesa.descricao).toBe('Fornecedor externo');
      expect(despesa.valor).toBe(5000);
      expect(despesa.idCategoria).toBe(5);
      expect(despesa.meioPagamento).toBe(MeioPagamento.DIN);
      expect(despesa.idCarteira).toBe(2);
      expect(despesa.observacao).toBeUndefined();
    });

    it('deve fazer trim na descricao e observacao', () => {
      const despesa = new Despesa();
      despesa.atualizar(input);

      expect(despesa.descricao).toBe('Compra de materiais');
      expect(despesa.observacao).toBe('Nota fiscal 123');
    });

    it('não deve alterar o idUsuarioInclusao ao atualizar', () => {
      const despesa = Despesa.criar(input);
      despesa.atualizar({ ...input, descricao: 'Outro' });

      expect(despesa.idUsuarioInclusao).toBe(7);
    });
  });
});
