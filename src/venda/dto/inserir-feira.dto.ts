import { Transform } from 'class-transformer';
import { trimStringValue } from '../../common/transforms/trim-string.transform';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InserirFeiraDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome da feira deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da feira é obrigatório.' })
  @MinLength(2, {
    message: 'O nome da feira deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome da feira deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O local da feira deve ser um texto.' })
  @MaxLength(120, {
    message: 'O local da feira deve ter no máximo 120 caracteres.',
  })
  local?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição da feira deve ser um texto.' })
  @MaxLength(500, {
    message: 'A descrição da feira deve ter no máximo 500 caracteres.',
  })
  descricao?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}
