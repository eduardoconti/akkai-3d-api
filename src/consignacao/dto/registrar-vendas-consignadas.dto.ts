import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class RegistrarItemVendaConsignadaDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do produto vendido pelo revendedor.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O produto vendido deve ser um número inteiro.' })
  @Min(1, { message: 'O produto vendido deve ser maior que zero.' })
  idProduto!: number;

  @ApiProperty({
    example: 2,
    description: 'Quantidade vendida pelo revendedor.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade vendida deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade vendida deve ser maior que zero.' })
  quantidade!: number;
}

export class RegistrarVendasConsignadasDto {
  @ApiProperty({
    type: [RegistrarItemVendaConsignadaDto],
    description:
      'Lista de produtos vendidos no período informado pelo revendedor.',
  })
  @IsArray({ message: 'Os itens vendidos devem ser uma lista.' })
  @ArrayMinSize(1, {
    message: 'Informe pelo menos um item vendido.',
  })
  @ValidateNested({ each: true })
  @Type(() => RegistrarItemVendaConsignadaDto)
  itens!: RegistrarItemVendaConsignadaDto[];
}
