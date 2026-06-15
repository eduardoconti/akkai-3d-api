import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AlterarItemConsignacaoDto {
  @ApiProperty({
    example: 5,
    description: 'Nova quantidade enviada para o revendedor.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade enviada deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade enviada deve ser maior que zero.' })
  quantidade!: number;

  @ApiProperty({
    example: 2500,
    required: false,
    description:
      'Novo valor unitário em centavos combinado para venda consignada.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O valor unitário deve ser informado em centavos.' })
  @Min(0, { message: 'O valor unitário não pode ser negativo.' })
  @Max(1000000, {
    message: 'O valor unitário deve ser de no máximo R$ 10.000,00.',
  })
  valorUnitario?: number;
}
