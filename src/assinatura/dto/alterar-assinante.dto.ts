import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { StatusAssinante } from '@assinatura/enums';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class AlterarAssinanteDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do assinante deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do assinante é obrigatório.' })
  @MaxLength(120, {
    message: 'O nome do assinante deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O e-mail deve ser um texto.' })
  @MaxLength(120, { message: 'O e-mail deve ter no máximo 120 caracteres.' })
  email?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O telefone deve ser um texto.' })
  @MaxLength(30, { message: 'O telefone deve ter no máximo 30 caracteres.' })
  telefone?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O endereço de entrega deve ser um texto.' })
  @MaxLength(500, {
    message: 'O endereço de entrega deve ter no máximo 500 caracteres.',
  })
  enderecoEntrega?: string;

  @Type(() => Number)
  @IsInt({ message: 'O plano deve ser um número inteiro.' })
  @Min(1, { message: 'O plano deve ser maior que zero.' })
  @Max(2147483647, { message: 'O plano ultrapassa o limite permitido.' })
  idPlano!: number;

  @IsEnum(StatusAssinante, {
    message: 'O status deve ser ATIVO, PAUSADO ou CANCELADO.',
  })
  status!: StatusAssinante;
}
