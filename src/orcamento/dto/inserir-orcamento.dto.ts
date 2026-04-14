import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class InserirOrcamentoDto {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  @MinLength(2, {
    message: 'O nome do cliente deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome do cliente deve ter no máximo 120 caracteres.',
  })
  nomeCliente!: string;

  @Transform(trimStringValue)
  @IsString({ message: 'O telefone do cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O telefone do cliente é obrigatório.' })
  @MinLength(8, {
    message: 'O telefone do cliente deve ter pelo menos 8 caracteres.',
  })
  @MaxLength(30, {
    message: 'O telefone do cliente deve ter no máximo 30 caracteres.',
  })
  telefoneCliente!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(1000, {
    message: 'A descrição deve ter no máximo 1000 caracteres.',
  })
  descricao?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsUrl(
    { require_protocol: true },
    { message: 'O link STL deve ser uma URL válida.' },
  )
  @MaxLength(500, {
    message: 'O link STL deve ter no máximo 500 caracteres.',
  })
  linkSTL?: string;
}
