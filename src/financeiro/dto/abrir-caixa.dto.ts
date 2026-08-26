import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CarteiraAberturaCaixaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCarteira!: number;

  @ApiProperty({ example: 15000, description: 'Valor em centavos.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  valorAbertura!: number;
}

export class AbrirCaixaDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idFeira!: number;

  @ApiProperty({ type: [CarteiraAberturaCaixaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CarteiraAberturaCaixaDto)
  carteiras!: CarteiraAberturaCaixaDto[];

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}
