import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { TAMANHO_PAGINA_PADRAO } from '@common/constants/paginacao.constants';
import { ValidarTamanhoPagina } from '@common/decorators/validar-tamanho-pagina.decorator';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior que zero.' })
  pagina = 1;

  @ValidarTamanhoPagina()
  tamanhoPagina = TAMANHO_PAGINA_PADRAO;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'O texto de pesquisa deve ser um texto.' })
  termo?: string;
}
