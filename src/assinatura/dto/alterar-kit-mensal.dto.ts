import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class AlterarItemKitMensalDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do produto deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  @MaxLength(120, {
    message: 'O nome do produto deve ter no máximo 120 caracteres.',
  })
  nomeProduto!: string;

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
  @IsArray({ message: 'Os itens do kit devem ser enviados em uma lista.' })
  @ArrayMinSize(1, { message: 'O kit deve possuir ao menos 1 item.' })
  @ValidateNested({ each: true })
  @Type(() => AlterarItemKitMensalDto)
  itens!: AlterarItemKitMensalDto[];
}
