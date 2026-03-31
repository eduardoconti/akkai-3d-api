import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimStringValue } from '../transforms/trim-string.transform';

export class PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior que zero.' })
  pagina = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O tamanho da página deve ser um número inteiro.' })
  @Min(1, { message: 'O tamanho da página deve ser maior que zero.' })
  @Max(50, { message: 'O tamanho da página deve ser de no máximo 50 itens.' })
  tamanhoPagina = 10;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O texto de pesquisa deve ser um texto.' })
  termo?: string;
}
