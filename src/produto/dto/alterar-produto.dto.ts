import { Transform, Type } from 'class-transformer';
import { trimStringValue } from '../../common/transforms/trim-string.transform';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AlterarProdutoDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do produto deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  @MinLength(2, {
    message: 'O nome do produto deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome do produto deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @Transform(trimStringValue)
  @IsString({ message: 'O código do produto deve ser um texto.' })
  @IsNotEmpty({ message: 'O código do produto é obrigatório.' })
  @MinLength(2, {
    message: 'O código do produto deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(40, {
    message: 'O código do produto deve ter no máximo 40 caracteres.',
  })
  codigo!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição do produto deve ser um texto.' })
  @MaxLength(500, {
    message: 'A descrição do produto deve ter no máximo 500 caracteres.',
  })
  descricao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'O estoque mínimo do produto deve ser um número inteiro.',
  })
  @Min(0, {
    message: 'O estoque mínimo do produto não pode ser negativo.',
  })
  @Max(100, {
    message: 'O estoque mínimo do produto deve ser de no máximo 100 unidades.',
  })
  estoqueMinimo?: number;

  @Type(() => Number)
  @IsInt({ message: 'A categoria do produto deve ser um número inteiro.' })
  @Min(1, { message: 'A categoria do produto deve ser maior que zero.' })
  idCategoria!: number;

  @Type(() => Number)
  @IsInt({ message: 'O valor do produto deve ser informado em centavos.' })
  @Min(50, { message: 'O valor do produto deve ser de no mínimo R$ 0,50.' })
  @Max(100000, {
    message: 'O valor do produto deve ser de no máximo R$ 1.000,00.',
  })
  valor!: number;
}
