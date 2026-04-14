import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from './movimentacao-estoque.entity';

describe('MovimentacaoEstoque', () => {
  describe('criar', () => {
    const input: CriarMovimentacaoEstoqueInput = {
      idProduto: 10,
      quantidade: 5,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem: OrigemMovimentacaoEstoque.VENDA,
      idUsuarioInclusao: 3,
    };

    it('deve criar a movimentação com os dados fornecidos', () => {
      const movimentacao = MovimentacaoEstoque.criar(input);

      expect(movimentacao.idProduto).toBe(10);
      expect(movimentacao.quantidade).toBe(5);
      expect(movimentacao.tipo).toBe(TipoMovimentacaoEstoque.SAIDA);
      expect(movimentacao.origem).toBe(OrigemMovimentacaoEstoque.VENDA);
      expect(movimentacao.idUsuarioInclusao).toBe(3);
    });

    it('deve definir dataInclusao como a data atual', () => {
      const antes = new Date();
      const movimentacao = MovimentacaoEstoque.criar(input);
      const depois = new Date();

      expect(movimentacao.dataInclusao.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(movimentacao.dataInclusao.getTime()).toBeLessThanOrEqual(
        depois.getTime(),
      );
    });

    it('deve criar movimentação de entrada corretamente', () => {
      const entradaInput: CriarMovimentacaoEstoqueInput = {
        ...input,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.COMPRA,
      };

      const movimentacao = MovimentacaoEstoque.criar(entradaInput);

      expect(movimentacao.tipo).toBe(TipoMovimentacaoEstoque.ENTRADA);
      expect(movimentacao.origem).toBe(OrigemMovimentacaoEstoque.COMPRA);
    });
  });
});
