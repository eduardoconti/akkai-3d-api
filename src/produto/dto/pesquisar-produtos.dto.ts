import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
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

export class PesquisarProdutosDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsIn(['nome', 'codigo', 'estoqueMinimo'], {
    message:
      'A ordenação dos produtos deve ser por nome, código ou estoque mínimo.',
  })
  ordenarPor?: 'nome' | 'codigo' | 'estoqueMinimo' = 'nome';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'asc';

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
