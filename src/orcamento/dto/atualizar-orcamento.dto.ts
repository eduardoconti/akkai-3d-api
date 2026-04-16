import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';
import { StatusOrcamento, TipoOrcamento } from '@orcamento/entities';

export class AtualizarOrcamentoDto {
  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do cliente deve ser um texto.' })
  @MinLength(2, {
    message: 'O nome do cliente deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome do cliente deve ter no máximo 120 caracteres.',
  })
  nomeCliente?: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O telefone do cliente deve ser um texto.' })
  @MinLength(8, {
    message: 'O telefone do cliente deve ter pelo menos 8 caracteres.',
  })
  @MaxLength(30, {
    message: 'O telefone do cliente deve ter no máximo 30 caracteres.',
  })
  telefoneCliente?: string;

  @IsOptional()
  @IsEnum(TipoOrcamento, { message: 'O tipo do orçamento é inválido.' })
  tipo?: TipoOrcamento;

  @IsOptional()
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @IsPositive({ message: 'Selecione uma feira válida.' })
  idFeira?: number;

  @IsOptional()
  @IsEnum(StatusOrcamento, { message: 'O status do orçamento é inválido.' })
  status?: StatusOrcamento;

  @IsOptional()
  @IsInt({ message: 'O valor deve ser um número inteiro (em centavos).' })
  @IsPositive({ message: 'O valor deve ser maior que zero.' })
  valor?: number;

  @IsOptional()
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero.' })
  quantidade?: number;

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
