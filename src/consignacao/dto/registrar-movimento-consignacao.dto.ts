import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RegistrarMovimentoConsignacaoDto {
  @ApiProperty({
    example: 2,
    description: 'Quantidade vendida ou devolvida pelo revendedor.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser maior que zero.' })
  quantidade!: number;
}
