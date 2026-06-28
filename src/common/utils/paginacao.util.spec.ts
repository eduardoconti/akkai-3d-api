import {
  calcularOffset,
  criarMetadadosPaginacao,
  criarResultadoPaginado,
} from './paginacao.util';

describe('utilitários de paginação', () => {
  it('deve calcular o deslocamento da página', () => {
    expect(calcularOffset(3, 25)).toBe(50);
  });

  it('deve manter ao menos uma página quando não houver itens', () => {
    expect(criarMetadadosPaginacao(1, 25, 0)).toEqual({
      pagina: 1,
      tamanhoPagina: 25,
      totalItens: 0,
      totalPaginas: 1,
    });
  });

  it('deve criar resultado paginado com arredondamento para cima', () => {
    expect(criarResultadoPaginado(['item'], 2, 25, 26)).toEqual({
      itens: ['item'],
      pagina: 2,
      tamanhoPagina: 25,
      totalItens: 26,
      totalPaginas: 2,
    });
  });
});
