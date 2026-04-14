import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class InserirCarteiraDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'O nome da carteira deve ser um texto.' })
  @MinLength(2, {
    message: 'O nome da carteira deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome da carteira deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;

  @IsOptional()
  @IsArray({ message: 'Os meios de pagamento devem ser uma lista.' })
  @IsEnum(MeioPagamento, {
    each: true,
    message: `Cada meio de pagamento deve ser um dos valores: ${Object.values(MeioPagamento).join(', ')}.`,
  })
  meiosPagamento?: MeioPagamento[];
}
