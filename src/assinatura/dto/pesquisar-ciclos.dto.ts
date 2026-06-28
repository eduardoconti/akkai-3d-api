import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { StatusCiclo } from '@assinatura/enums';

export class PesquisarCiclosDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O assinante deve ser um número inteiro.' })
  @Min(1, { message: 'O assinante deve ser maior que zero.' })
  idAssinante?: number;

  @IsOptional()
  @IsEnum(StatusCiclo, {
    message:
      'O status deve ser PENDENTE, EM_PREPARO, ENVIADO, ENTREGUE ou CANCELADO.',
  })
  status?: StatusCiclo;

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
