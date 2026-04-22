import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ObterRelatorioProducaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior que zero.' })
  pagina = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O tamanho da página deve ser um número inteiro.' })
  @Min(1, { message: 'O tamanho da página deve ser maior que zero.' })
  tamanhoPagina = 10;

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
