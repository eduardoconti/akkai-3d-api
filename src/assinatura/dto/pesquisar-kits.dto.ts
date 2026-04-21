import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarKitsDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O plano deve ser um número inteiro.' })
  @Min(1, { message: 'O plano deve ser maior que zero.' })
  idPlano?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O mês de referência deve ser um número inteiro.' })
  @Min(1, { message: 'O mês deve ser entre 1 e 12.' })
  @Max(12, { message: 'O mês deve ser entre 1 e 12.' })
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ano de referência deve ser um número inteiro.' })
  @Min(2020, { message: 'O ano deve ser maior que 2020.' })
  @Max(2100, { message: 'O ano deve ser menor que 2100.' })
  ano?: number;
}
