import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { TAMANHO_PAGINA_PADRAO } from '@common/constants/paginacao.constants';
import { ValidarTamanhoPagina } from '@common/decorators/validar-tamanho-pagina.decorator';

export class ObterRelatorioProducaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior que zero.' })
  pagina = 1;

  @ValidarTamanhoPagina()
  tamanhoPagina = TAMANHO_PAGINA_PADRAO;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data inicial deve estar em um formato de data válido.',
    },
  )
  dataInicio!: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final deve estar em um formato de data válido.',
    },
  )
  dataFim?: string;

  @IsOptional()
  @IsIn(['codigo', 'nome', 'quantidadeProduzida', 'valorEstimado'], {
    message:
      'A ordenação deve ser por codigo, nome, quantidadeProduzida ou valorEstimado.',
  })
  ordenarPor?: 'codigo' | 'nome' | 'quantidadeProduzida' | 'valorEstimado' =
    'quantidadeProduzida';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'desc';
}
