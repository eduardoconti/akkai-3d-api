import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

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
    example: 1,
    description: 'Carteira que receberá o valor das vendas consignadas.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A carteira do pagamento deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira do pagamento deve ser maior que zero.' })
  idCarteira!: number;

  @ApiProperty({
    enum: MeioPagamento,
    example: MeioPagamento.PIX,
    description: 'Meio de pagamento utilizado pelo revendedor.',
  })
  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento!: MeioPagamento;

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
