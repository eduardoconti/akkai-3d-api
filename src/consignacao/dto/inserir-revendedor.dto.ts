import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trimStringValue } from '@common/transforms/trim-string.transform';
import { StatusRevendedor } from '@consignacao/entities';

export class InserirRevendedorDto {
  @ApiProperty({
    example: 'Loja Centro 3D',
    description: 'Nome do revendedor.',
  })
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do revendedor deve ser um texto.' })
  @MinLength(2, {
    message: 'O nome do revendedor deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'O nome do revendedor deve ter no máximo 120 caracteres.',
  })
  nome!: string;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone de contato do revendedor.',
  })
  @Transform(trimStringValue)
  @IsString({ message: 'O telefone do revendedor deve ser um texto.' })
  @MinLength(8, {
    message: 'O telefone do revendedor deve ter pelo menos 8 caracteres.',
  })
  @MaxLength(30, {
    message: 'O telefone do revendedor deve ter no máximo 30 caracteres.',
  })
  telefone!: string;

  @ApiPropertyOptional({
    enum: StatusRevendedor,
    example: StatusRevendedor.ATIVO,
    description: 'Status cadastral do revendedor.',
  })
  @IsOptional()
  @IsEnum(StatusRevendedor, {
    message: `O status do revendedor deve ser um dos valores: ${Object.values(StatusRevendedor).join(', ')}.`,
  })
  status?: StatusRevendedor;

  @ApiPropertyOptional({
    example: 20,
    description: 'Percentual de desconto aplicado sobre as peças.',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O desconto do revendedor deve ser um número.' },
  )
  @Min(0, { message: 'O desconto do revendedor não pode ser negativo.' })
  @Max(100, { message: 'O desconto do revendedor não pode passar de 100%.' })
  percentualDesconto?: number;
}
