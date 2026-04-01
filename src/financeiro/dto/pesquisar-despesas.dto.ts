import { IsDateString, IsOptional } from 'class-validator';
import { PesquisaPaginadaDto } from '../../common/dto/pesquisa-paginada.dto';

export class PesquisarDespesasDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data inicial da despesa deve estar em um formato válido.' },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data final da despesa deve estar em um formato válido.' },
  )
  dataFim?: string;
}
