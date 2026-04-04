import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TipoVenda } from '@venda/entities/venda.entity';

export class ObterResumoVendasPeriodoDto {
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
  @IsEnum(TipoVenda, {
    message: 'O tipo de venda deve ser FEIRA, LOJA ou ONLINE.',
  })
  tipoVenda?: TipoVenda;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  idFeira?: number;
}
