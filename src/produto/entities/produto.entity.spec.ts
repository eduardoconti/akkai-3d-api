import { CriarProdutoInput, Produto, ProdutoInput } from './produto.entity';

describe('Produto', () => {
  const input: CriarProdutoInput = {
    nome: 'Caneca Geek',
    codigo: 'CAN-001',
    descricao: 'Caneca temática',
    estoqueMinimo: 5,
    idCategoria: 1,
    valor: 3500,
    idUsuarioInclusao: 42,
  };

  describe('criar', () => {
    it('deve criar um produto com os dados fornecidos', () => {
      const produto = Produto.criar(input);

      expect(produto.idUsuarioInclusao).toBe(42);
      expect(produto.nome).toBe(input.nome);
      expect(produto.codigo).toBe(input.codigo);
      expect(produto.descricao).toBe(input.descricao);
      expect(produto.estoqueMinimo).toBe(input.estoqueMinimo);
      expect(produto.idCategoria).toBe(input.idCategoria);
      expect(produto.valor).toBe(input.valor);
    });

    it('deve criar produto sem descricao e estoqueMinimo quando não informados', () => {
      const { descricao, estoqueMinimo, ...semOpcionais } = input;
      const produto = Produto.criar(semOpcionais);

      expect(produto.descricao).toBeUndefined();
      expect(produto.estoqueMinimo).toBeUndefined();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar todos os campos do produto', () => {
      const produto = Produto.criar(input);
      const novoInput: ProdutoInput = {
        nome: 'Vaso Decorativo',
        codigo: 'VAS-002',
        idCategoria: 2,
        valor: 8000,
      };

      produto.atualizar(novoInput);

      expect(produto.nome).toBe(novoInput.nome);
      expect(produto.codigo).toBe(novoInput.codigo);
      expect(produto.descricao).toBeUndefined();
      expect(produto.estoqueMinimo).toBeUndefined();
      expect(produto.idCategoria).toBe(novoInput.idCategoria);
      expect(produto.valor).toBe(novoInput.valor);
    });

    it('não deve alterar o idUsuarioInclusao ao atualizar', () => {
      const produto = Produto.criar(input);
      produto.atualizar({ ...input, nome: 'Novo Nome' });

      expect(produto.idUsuarioInclusao).toBe(42);
    });
  });
});
