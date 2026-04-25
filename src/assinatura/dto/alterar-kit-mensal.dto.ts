import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class AlterarItemKitMensalDto {
  @Type(() => Number)
  @IsInt({ message: 'O produto deve ser um número inteiro.' })
  @Min(1, { message: 'O produto deve ser maior que zero.' })
  @Max(2147483647, { message: 'O produto ultrapassa o limite permitido.' })
  idProduto!: number;

  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser de no mínimo 1 unidade.' })
  @Max(9999, { message: 'A quantidade deve ser de no máximo 9999 unidades.' })
  quantidade!: number;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A observação deve ser um texto.' })
  observacao?: string;
}

export class AlterarKitMensalDto {
  @IsOptional()
  @IsArray({ message: 'Os itens do kit devem ser enviados em uma lista.' })
  @ArrayMinSize(1, { message: 'O kit deve possuir ao menos 1 item.' })
  @ValidateNested({ each: true })
  @Type(() => AlterarItemKitMensalDto)
  itens?: AlterarItemKitMensalDto[];

  // ── Vitrine ──────────────────────────────────────────────────────────────

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O título deve ser um texto.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  titulo?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A chamada deve ser um texto.' })
  @MaxLength(500, { message: 'A chamada deve ter no máximo 500 caracteres.' })
  chamada?: string;

  @IsOptional()
  @IsBoolean({ message: 'O indicador de ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;

  @IsOptional()
  @IsArray({ message: 'Os itens da vitrine devem ser uma lista de textos.' })
  @IsString({ each: true, message: 'Cada item da vitrine deve ser um texto.' })
  itensVitrine?: string[];
}
