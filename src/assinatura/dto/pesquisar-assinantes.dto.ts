import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { StatusAssinante } from '@assinatura/entities';

export class PesquisarAssinantesDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsEnum(StatusAssinante, {
    message: 'O status deve ser ATIVO, PAUSADO ou CANCELADO.',
  })
  status?: StatusAssinante;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O plano deve ser um número inteiro.' })
  @Min(1, { message: 'O plano deve ser maior que zero.' })
  idPlano?: number;
}
