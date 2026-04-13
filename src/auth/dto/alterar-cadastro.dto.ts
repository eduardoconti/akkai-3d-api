import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { trimStringValue } from '../../common/transforms/trim-string.transform';

export class AlterarCadastroDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome deve ser um texto.' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres.' })
  name!: string;

  @Transform(trimStringValue)
  @IsString({ message: 'O login deve ser um texto.' })
  @MinLength(3, { message: 'O login deve ter pelo menos 3 caracteres.' })
  @Matches(/^[A-Za-z]+$/, {
    message: 'O login deve conter apenas letras.',
  })
  login!: string;

  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  isActive!: boolean;

  @Type(() => Number)
  @IsInt({ message: 'O papel deve ser um número inteiro.' })
  @Min(1, { message: 'O papel deve ser maior que zero.' })
  roleId!: number;
}
