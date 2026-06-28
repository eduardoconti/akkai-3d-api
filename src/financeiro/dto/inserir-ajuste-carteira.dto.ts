import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAjusteCarteira } from '@financeiro/enums';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class InserirAjusteCarteiraDto {
  @ApiProperty({
    example: '2026-06-10',
    description: 'Data em que o ajuste deve impactar a carteira.',
  })
  @IsDateString(
    {},
    { message: 'A data do ajuste deve estar em um formato válido.' },
  )
  dataAjuste!: string;

  @ApiProperty({
    enum: TipoAjusteCarteira,
    example: TipoAjusteCarteira.CREDITO,
    description: 'Tipo do ajuste: CREDITO aumenta o saldo e DEBITO diminui.',
  })
  @IsEnum(TipoAjusteCarteira, {
    message: 'O tipo do ajuste deve ser CREDITO ou DEBITO.',
  })
  tipo!: TipoAjusteCarteira;

  @ApiProperty({
    example: 5000,
    description: 'Valor do ajuste em centavos.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O valor do ajuste deve ser informado em centavos.' })
  @Min(1, { message: 'O valor do ajuste deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'O valor do ajuste ultrapassa o limite permitido.',
  })
  valor!: number;

  @ApiProperty({
    example: 'Correção de saldo',
    description: 'Motivo resumido do ajuste.',
  })
  @Transform(trimStringValue)
  @IsString({ message: 'O motivo do ajuste deve ser um texto.' })
  @MinLength(3, {
    message: 'O motivo do ajuste deve ter pelo menos 3 caracteres.',
  })
  @MaxLength(120, {
    message: 'O motivo do ajuste deve ter no máximo 120 caracteres.',
  })
  motivo!: string;

  @ApiPropertyOptional({
    example: 'Diferença encontrada na conferência manual da carteira.',
    description: 'Observação complementar do ajuste.',
  })
  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A observação do ajuste deve ser um texto.' })
  @MaxLength(500, {
    message: 'A observação do ajuste deve ter no máximo 500 caracteres.',
  })
  observacao?: string;
}
