export function normalizarLista<T extends string>(
  valor: unknown,
  valoresPadrao?: readonly T[],
): T[] | undefined {
  if (valor === undefined || valor === null || valor === '') {
    return valoresPadrao ? [...valoresPadrao] : undefined;
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean) as T[];
  }

  if (typeof valor === 'string' || typeof valor === 'number') {
    return String(valor)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean) as T[];
  }

  return valoresPadrao ? [...valoresPadrao] : undefined;
}

export function normalizarListaNumerica(valor: unknown): number[] | undefined {
  return normalizarLista(valor)?.map((item) => Number(item));
}
