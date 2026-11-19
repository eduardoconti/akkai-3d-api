import { normalizarBooleano } from './normalizar-booleano.transform';

describe('normalizarBooleano', () => {
  it.each([
    ['true', true],
    ['TRUE', true],
    [' 1 ', true],
    [true, true],
    ['false', false],
    ['0', false],
    [false, false],
  ])('deve normalizar %p para %p', (valor, esperado) => {
    expect(normalizarBooleano(valor)).toBe(esperado);
  });

  it.each([['abc'], [undefined], [null], [1]])(
    'deve manter o valor %p sem alteração',
    (valor) => {
      expect(normalizarBooleano(valor)).toBe(valor);
    },
  );
});
