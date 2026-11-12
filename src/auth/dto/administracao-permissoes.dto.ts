import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';
import {
  DefinirPermissoesUsuarioInput,
  PapelComPermissoes,
  PermissaoDisponivel,
  PermissoesUsuario,
  SalvarPapelInput,
  UsuarioAdministravel,
} from '@auth/interfaces/administracao-permissoes.interface';

export class DefinirPermissoesUsuarioDto
  implements DefinirPermissoesUsuarioInput
{
  @Type(() => Number)
  @IsInt({ message: 'O papel deve ser um número inteiro.' })
  @Min(1, { message: 'O papel deve ser maior que zero.' })
  idPapel!: number;

  /** Conjunto final de permissões do usuário (papel + ajustes individuais). */
  @IsArray({ message: 'As permissões devem ser uma lista.' })
  @ArrayUnique({ message: 'As permissões não podem se repetir.' })
  @IsString({ each: true, message: 'Cada permissão deve ser um texto.' })
  permissoes!: string[];
}

export class UsuarioAdministravelDto implements UsuarioAdministravel {
  id!: number;
  login!: string;
  name!: string;
  isActive!: boolean;
  idPapel!: number;
  papel!: string;
  quantidadePermissoes!: number;
  /** Permissões concedidas ou revogadas além do que o papel define. */
  quantidadeAjustes!: number;
}

export class PermissaoDisponivelDto implements PermissaoDisponivel {
  name!: string;
  description?: string;
}

export class PapelComPermissoesDto implements PapelComPermissoes {
  id!: number;
  name!: string;
  description?: string;
  permissoes!: string[];
  quantidadeUsuarios!: number;
  protegido!: boolean;
}

export class SalvarPapelDto implements SalvarPapelInput {
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do papel deve ser um texto.' })
  @MinLength(2, {
    message: 'O nome do papel deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(100, {
    message: 'O nome do papel deve ter no máximo 100 caracteres.',
  })
  name!: string;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres.' })
  description?: string;

  @IsArray({ message: 'As permissões devem ser uma lista.' })
  @ArrayUnique({ message: 'As permissões não podem se repetir.' })
  @IsString({ each: true, message: 'Cada permissão deve ser um texto.' })
  permissoes!: string[];
}

export class PermissoesUsuarioDto implements PermissoesUsuario {
  id!: number;
  login!: string;
  name!: string;
  isActive!: boolean;
  idPapel!: number;
  papel!: string;
  permissoesEfetivas!: string[];
  concedidas!: string[];
  revogadas!: string[];
}
