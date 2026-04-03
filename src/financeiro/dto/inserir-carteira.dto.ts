import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InserirCarteiraDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'O nome da carteira deve ser um texto.' })
  @MinLength(2, {
    message: 'O nome da carteira deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome da carteira deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}
