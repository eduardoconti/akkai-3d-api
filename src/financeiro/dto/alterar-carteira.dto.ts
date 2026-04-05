import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { MeioPagamento } from '@venda/entities/meio-pagamento.enum';

export class AlterarCarteiraDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'O nome da carteira deve ser um texto.' })
  @Length(2, 120, {
    message: 'O nome da carteira deve ter entre 2 e 120 caracteres.',
  })
  nome!: string;

  @IsOptional()
  @IsBoolean({ message: 'O status da carteira deve ser verdadeiro ou falso.' })
  ativa?: boolean;

  @IsOptional()
  @IsArray({ message: 'Os meios de pagamento devem ser uma lista.' })
  @IsEnum(MeioPagamento, {
    each: true,
    message: `Cada meio de pagamento deve ser um dos valores: ${Object.values(MeioPagamento).join(', ')}.`,
  })
  meiosPagamento?: MeioPagamento[];
}
