import { Transform, Type } from 'class-transformer';
import { trimStringValue } from '@common/transforms/trim-string.transform';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class InserirCategoriaProdutoDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  @MinLength(2, {
    message: 'O nome da categoria deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(80, {
    message: 'O nome da categoria deve ter no máximo 80 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A categoria ascendente deve ser um número inteiro.' })
  @Min(1, {
    message: 'A categoria ascendente deve ser maior que zero.',
  })
  idAscendente?: number;
}
