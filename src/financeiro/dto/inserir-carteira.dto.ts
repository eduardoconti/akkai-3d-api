import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsEnum,
  Max,
  Min,
  IsOptional,
  IsString,
  ValidateIf,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class InserirCarteiraDto {
  @ApiProperty({
    example: 'TON-BAU',
    description: 'Nome identificador da carteira financeira.',
  })
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

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se a carteira está ativa para uso.',
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;

  @ApiPropertyOptional({
    enum: MeioPagamento,
    isArray: true,
    example: ['PIX', 'CRE'],
    description: 'Lista opcional dos meios de pagamento aceitos pela carteira.',
  })
  @IsOptional()
  @IsArray({ message: 'Os meios de pagamento devem ser uma lista.' })
  @IsEnum(MeioPagamento, {
    each: true,
    message: `Cada meio de pagamento deve ser um dos valores: ${Object.values(MeioPagamento).join(', ')}.`,
  })
  meiosPagamento?: MeioPagamento[];

  @ApiPropertyOptional({
    example: true,
    description:
      'Define se as vendas desta carteira devem ter imposto calculado automaticamente.',
  })
  @IsOptional()
  @IsBoolean({
    message: 'O campo consideraImpostoVenda deve ser verdadeiro ou falso.',
  })
  consideraImpostoVenda?: boolean;

  @ApiPropertyOptional({
    example: 4,
    description:
      'Percentual de imposto aplicado às vendas quando a carteira considerar imposto.',
  })
  @ValidateIf((dto: InserirCarteiraDto) => dto.consideraImpostoVenda === true)
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === undefined || value === ''
      ? undefined
      : Number(String(value).replace(',', '.')),
  )
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O percentual do imposto deve ser um número válido.' },
  )
  @Min(0, { message: 'O percentual do imposto não pode ser negativo.' })
  @Max(100, {
    message: 'O percentual do imposto deve ser de no máximo 100.',
  })
  percentualImpostoVenda?: number;
}
