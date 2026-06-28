import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { StatusCiclo } from '@assinatura/enums';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class AlterarItemCicloDto {
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

export class AlterarCicloDto {
  @IsEnum(StatusCiclo, {
    message:
      'O status deve ser PENDENTE, EM_PREPARO, ENVIADO, ENTREGUE ou CANCELADO.',
  })
  status!: StatusCiclo;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O código de rastreio deve ser um texto.' })
  @MaxLength(60, {
    message: 'O código de rastreio deve ter no máximo 60 caracteres.',
  })
  codigoRastreio?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A observação deve ser um texto.' })
  observacao?: string;

  @IsArray({ message: 'Os itens do ciclo devem ser enviados em uma lista.' })
  @ArrayMinSize(1, { message: 'O ciclo deve possuir ao menos 1 item.' })
  @ValidateNested({ each: true })
  @Type(() => AlterarItemCicloDto)
  itens!: AlterarItemCicloDto[];
}
