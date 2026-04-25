import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class InserirPlanoDto {
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

  @IsOptional()
  @IsBoolean({ message: 'O indicador de ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;

  // ── Vitrine ──────────────────────────────────────────────────────────────

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O slug deve ser um texto.' })
  @MaxLength(100, { message: 'O slug deve ter no máximo 100 caracteres.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens.',
  })
  slug?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O resumo deve ser um texto.' })
  @MaxLength(255, { message: 'O resumo deve ter no máximo 255 caracteres.' })
  resumo?: string;

  @IsOptional()
  @IsBoolean({ message: 'O destaque deve ser verdadeiro ou falso.' })
  destaque?: boolean;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A faixa etária deve ser um texto.' })
  @MaxLength(120, {
    message: 'A faixa etária deve ter no máximo 120 caracteres.',
  })
  faixaEtaria?: string;

  @IsOptional()
  @IsArray({ message: 'Os itens inclusos devem ser uma lista de textos.' })
  @IsString({ each: true, message: 'Cada item incluso deve ser um texto.' })
  itensInclusos?: string[];

  @IsOptional()
  @IsArray({ message: 'Os benefícios devem ser uma lista de textos.' })
  @IsString({ each: true, message: 'Cada benefício deve ser um texto.' })
  beneficios?: string[];
}
