import { Transform } from 'class-transformer';

export function TransformarPercentual(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return value;
    }

    return typeof value === 'string'
      ? Number(value.replace(',', '.'))
      : Number.NaN;
  });
}
