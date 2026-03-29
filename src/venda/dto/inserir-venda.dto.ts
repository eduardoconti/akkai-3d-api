/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento, TipoVenda } from '@venda/entities';
import { Type } from 'class-transformer';

export class InserirVendaDto {
  @IsEnum(TipoVenda)
  tipo!: TipoVenda;
  @IsEnum(MeioPagamento)
  meioPagamento!: MeioPagamento;
  @IsInt()
  @IsOptional()
  desconto?: number;
  @ValidateNested({ each: true })
  @Type(() => InserirItemVendaDto)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  itens!: InserirItemVendaDto[];
}

export class InserirItemVendaDto {
  @IsInt()
  idProduto!: number;
  @IsInt()
  @Min(1)
  @Max(500)
  quantidade!: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8000)
  desconto?: number;
}
