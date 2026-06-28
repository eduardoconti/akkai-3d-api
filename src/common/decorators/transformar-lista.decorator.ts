import { Transform } from 'class-transformer';
import {
  normalizarLista,
  normalizarListaNumerica,
} from '@common/transforms/normalizar-lista.transform';

export function TransformarLista<T extends string>(
  valoresPadrao?: readonly T[],
): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    normalizarLista(value, valoresPadrao),
  );
}

export function TransformarListaNumerica(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    normalizarListaNumerica(value),
  );
}
