import { Transform } from 'class-transformer';
import { normalizarBooleano } from '@common/transforms/normalizar-booleano.transform';

export function TransformarBooleano(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    normalizarBooleano(value),
  );
}
