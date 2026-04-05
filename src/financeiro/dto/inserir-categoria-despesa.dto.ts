import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { trimStringValue } from '../../common/transforms/trim-string.transform';

export class InserirCategoriaDespesaDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome da categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  @MinLength(2, {
    message: 'O nome da categoria deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(80, {
    message: 'O nome da categoria deve ter no máximo 80 caracteres.',
  })
  nome!: string;
}
