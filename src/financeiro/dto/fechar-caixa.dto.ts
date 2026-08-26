import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class CarteiraFechamentoCaixaDto {
  @Type(() => Number) @IsInt() @Min(1) idCarteira!: number;
  @Type(() => Number) @IsInt() @Min(0) valorInformadoFechamento!: number;
}

export class FecharCaixaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CarteiraFechamentoCaixaDto)
  carteiras!: CarteiraFechamentoCaixaDto[];
}
