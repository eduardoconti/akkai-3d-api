import {
  normalizarLista,
  normalizarListaNumerica,
} from './normalizar-lista.transform';

describe('normalizarLista', () => {
  it.each([
    ['A,B', ['A', 'B']],
    [
      [' A ', 'B', ''],
      ['A', 'B'],
    ],
    [1, ['1']],
  ])('deve normalizar %p', (valor, esperado) => {
    expect(normalizarLista(valor)).toEqual(esperado);
  });

  it('deve devolver uma cópia dos valores padrão quando o valor estiver ausente', () => {
    const valoresPadrao = ['A', 'B'] as const;
    const resultado = normalizarLista(undefined, valoresPadrao);

    expect(resultado).toEqual(valoresPadrao);
    expect(resultado).not.toBe(valoresPadrao);
  });

  it('deve devolver undefined para tipo não suportado sem valor padrão', () => {
    expect(normalizarLista({ valor: 'A' })).toBeUndefined();
  });
});

describe('normalizarListaNumerica', () => {
  it('deve converter uma lista CSV em números', () => {
    expect(normalizarListaNumerica('1, 2,3')).toEqual([1, 2, 3]);
  });
});
