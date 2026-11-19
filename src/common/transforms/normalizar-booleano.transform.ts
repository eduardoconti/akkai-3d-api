const VALORES_VERDADEIROS = ['true', '1'];
const VALORES_FALSOS = ['false', '0'];

/**
 * Converte valores booleanos recebidos por query string ("true", "1",
 * "false", "0") em boolean. Valores não reconhecidos são devolvidos sem
 * alteração para que a validação (ex.: `@IsBoolean`) os rejeite.
 */
export function normalizarBooleano(valor: unknown): unknown {
  if (typeof valor !== 'string') {
    return valor;
  }

  const normalizado = valor.trim().toLowerCase();

  if (VALORES_VERDADEIROS.includes(normalizado)) {
    return true;
  }

  if (VALORES_FALSOS.includes(normalizado)) {
    return false;
  }

  return valor;
}
