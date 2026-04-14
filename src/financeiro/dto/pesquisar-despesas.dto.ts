import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

function normalizeIdsCategorias(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value)
    ? value
    : typeof value === 'string' || typeof value === 'number'
      ? String(value)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

  if (!values) {
    return undefined;
  }

  return values.map((item) => Number(item));
}

export class PesquisarDespesasDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data inicial da despesa deve estar em um formato válido.' },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data final da despesa deve estar em um formato válido.' },
  )
  dataFim?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeIdsCategorias(value))
  @IsArray({
    message: 'As categorias devem ser informadas em formato de lista.',
  })
  @IsInt({ each: true, message: 'Cada categoria deve ser um número inteiro.' })
  @Min(1, {
    each: true,
    message: 'Cada categoria deve ser maior que zero.',
  })
  idsCategorias?: number[];
}
