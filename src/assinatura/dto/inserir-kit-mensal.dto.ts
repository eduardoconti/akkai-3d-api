import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class InserirItemKitMensalDto {
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

export class InserirKitMensalDto {
  @Type(() => Number)
  @IsInt({ message: 'O plano deve ser um número inteiro.' })
  @Min(1, { message: 'O plano deve ser maior que zero.' })
  @Max(2147483647, { message: 'O plano ultrapassa o limite permitido.' })
  idPlano!: number;

  @Type(() => Number)
  @IsInt({ message: 'O mês de referência deve ser um número inteiro.' })
  @Min(1, { message: 'O mês de referência deve ser entre 1 e 12.' })
  @Max(12, { message: 'O mês de referência deve ser entre 1 e 12.' })
  mesReferencia!: number;

  @Type(() => Number)
  @IsInt({ message: 'O ano de referência deve ser um número inteiro.' })
  @Min(2020, { message: 'O ano de referência deve ser maior que 2020.' })
  @Max(2100, { message: 'O ano de referência deve ser menor que 2100.' })
  anoReferencia!: number;

  @IsArray({ message: 'Os itens do kit devem ser enviados em uma lista.' })
  @ArrayMinSize(1, { message: 'O kit deve possuir ao menos 1 item.' })
  @ValidateNested({ each: true })
  @Type(() => InserirItemKitMensalDto)
  itens!: InserirItemKitMensalDto[];
}
