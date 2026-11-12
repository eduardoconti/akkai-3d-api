import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** Máximo de produtos por orçamento: o mesmo limite de itens de uma venda. */
export const MAXIMO_ITENS_ORCAMENTO = 12;

export class ItemOrcamentoDto {
  @ApiProperty({ example: 10, description: 'ID do produto do catálogo.' })
  @Type(() => Number)
  @IsInt({ message: 'O produto do item deve ser um número inteiro.' })
  @Min(1, { message: 'O produto do item deve ser maior que zero.' })
  @Max(2147483647, { message: 'O produto do item é inválido.' })
  idProduto!: number;

  @ApiProperty({ example: 2, minimum: 1, maximum: 500 })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade do item deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade do item deve ser de no mínimo 1 unidade.' })
  @Max(500, {
    message: 'A quantidade do item deve ser de no máximo 500 unidades.',
  })
  quantidade!: number;
}
