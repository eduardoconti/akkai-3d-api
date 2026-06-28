import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  TAMANHO_PAGINA_PADRAO,
  TAMANHOS_PAGINA_PERMITIDOS,
} from '@common/constants/paginacao.constants';
import { ValidarTamanhoPagina } from '@common/decorators/validar-tamanho-pagina.decorator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class PesquisaPaginadaDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior que zero.' })
  pagina = 1;

  @ApiPropertyOptional({
    default: TAMANHO_PAGINA_PADRAO,
    enum: TAMANHOS_PAGINA_PERMITIDOS,
  })
  @ValidarTamanhoPagina()
  tamanhoPagina = TAMANHO_PAGINA_PADRAO;

  @ApiPropertyOptional({ description: 'Texto livre para pesquisa.' })
  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O texto de pesquisa deve ser um texto.' })
  termo?: string;
}
