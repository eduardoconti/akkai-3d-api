import { ApiProperty } from '@nestjs/swagger';

export class TotalizadoresVendasDto {
  @ApiProperty({ example: 25 })
  quantidadeItensVendidos!: number;

  @ApiProperty({ example: 20 })
  quantidadeItensCatalogo!: number;

  @ApiProperty({ example: 3 })
  quantidadeBrindes!: number;

  @ApiProperty({ example: 2 })
  quantidadeItensAvulsos!: number;

  @ApiProperty({ example: 2200 })
  valorTotal!: number;

  @ApiProperty({ example: 100 })
  descontoTotal!: number;

  @ApiProperty({ example: 2046 })
  valorLiquido!: number;
}
