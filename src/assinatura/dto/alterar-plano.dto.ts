import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class AlterarPlanoDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do plano deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do plano é obrigatório.' })
  @MaxLength(120, {
    message: 'O nome do plano deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição do plano deve ser um texto.' })
  descricao?: string;

  @Type(() => Number)
  @IsInt({ message: 'O valor do plano deve ser informado em centavos.' })
  @Min(1, { message: 'O valor do plano deve ser maior que zero.' })
  @Max(100000000, {
    message: 'O valor do plano ultrapassa o limite permitido.',
  })
  valor!: number;

  @IsBoolean({ message: 'O indicador de ativo deve ser verdadeiro ou falso.' })
  ativo!: boolean;
}
