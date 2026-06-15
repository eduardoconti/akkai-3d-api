import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarTransferenciasCarteiraDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'A data inicial da transferência deve estar em um formato válido.',
    },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final da transferência deve estar em um formato válido.',
    },
  )
  dataFim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A carteira de origem deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira de origem deve ser maior que zero.' })
  idCarteiraOrigem?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A carteira de destino deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira de destino deve ser maior que zero.' })
  idCarteiraDestino?: number;
}
