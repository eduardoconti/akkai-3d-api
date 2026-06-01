import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class InserirItemConsignacaoDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do produto enviado em consignação.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O produto do item deve ser um número inteiro.' })
  @Min(1, { message: 'O produto do item deve ser maior que zero.' })
  idProduto!: number;

  @ApiProperty({
    example: 5,
    description: 'Quantidade enviada para o revendedor.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade enviada deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade enviada deve ser maior que zero.' })
  quantidade!: number;

  @ApiProperty({
    example: 2500,
    required: false,
    description:
      'Valor unitário em centavos combinado para venda consignada. Quando omitido, usa o valor atual do produto.',
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

export class InserirConsignacaoDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do revendedor que receberá as peças.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O revendedor deve ser um número inteiro.' })
  @Min(1, { message: 'O revendedor deve ser maior que zero.' })
  idRevendedor!: number;

  @ApiProperty({
    type: [InserirItemConsignacaoDto],
    description: 'Produtos enviados para o revendedor.',
  })
  @IsArray({ message: 'Os itens da consignação devem ser uma lista.' })
  @ArrayMinSize(1, {
    message: 'A consignação deve possuir pelo menos um item.',
  })
  @ValidateNested({ each: true })
  @Type(() => InserirItemConsignacaoDto)
  itens!: InserirItemConsignacaoDto[];
}
