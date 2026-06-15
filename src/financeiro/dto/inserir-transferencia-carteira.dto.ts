import { Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InserirTransferenciaCarteiraDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador da carteira de origem.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A carteira de origem deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira de origem deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A carteira de origem ultrapassa o limite permitido.',
  })
  idCarteiraOrigem!: number;

  @ApiProperty({
    example: 2,
    description: 'Identificador da carteira de destino.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A carteira de destino deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira de destino deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A carteira de destino ultrapassa o limite permitido.',
  })
  idCarteiraDestino!: number;

  @ApiProperty({
    example: 10000,
    description: 'Valor transferido em centavos.',
  })
  @Type(() => Number)
  @IsInt({
    message: 'O valor da transferência deve ser informado em centavos.',
  })
  @Min(1, { message: 'O valor da transferência deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'O valor da transferência ultrapassa o limite permitido.',
  })
  valor!: number;

  @ApiProperty({
    example: '2026-06-10',
    description: 'Data em que a transferência deve impactar as carteiras.',
  })
  @IsDateString(
    {},
    { message: 'A data da transferência deve estar em um formato válido.' },
  )
  dataTransferencia!: string;
}
