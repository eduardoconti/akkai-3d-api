import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarCaixasDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data inicial deve estar em um formato válido.' },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data final deve estar em um formato válido.' },
  )
  dataFim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  idFeira?: number;
}
