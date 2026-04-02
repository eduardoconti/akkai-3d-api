import { trimStringValue } from './trim-string.transform';

describe('trimStringValue', () => {
  it('deve remover espaços no início e fim de uma string', () => {
    expect(trimStringValue({ value: '  texto  ' })).toBe('texto');
  });

  it('deve retornar a string sem espaços inalterada', () => {
    expect(trimStringValue({ value: 'texto' })).toBe('texto');
  });

  it('deve retornar string vazia quando o valor for só espaços', () => {
    expect(trimStringValue({ value: '   ' })).toBe('');
  });

  it('deve retornar número sem alteração', () => {
    expect(trimStringValue({ value: 42 })).toBe(42);
  });

  it('deve retornar null sem alteração', () => {
    expect(trimStringValue({ value: null })).toBeNull();
  });

  it('deve retornar undefined sem alteração', () => {
    expect(trimStringValue({ value: undefined })).toBeUndefined();
  });

  it('deve retornar objeto sem alteração', () => {
    const obj = { foo: 'bar' };
    expect(trimStringValue({ value: obj })).toBe(obj);
  });
});
