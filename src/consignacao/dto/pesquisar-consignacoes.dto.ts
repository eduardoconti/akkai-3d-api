import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { StatusConsignacao } from '@consignacao/enums';

export class PesquisarConsignacoesDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra consignações por revendedor.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O revendedor deve ser um número inteiro.' })
  @Min(1, { message: 'O revendedor deve ser maior que zero.' })
  idRevendedor?: number;

  @ApiPropertyOptional({
    enum: StatusConsignacao,
    description: 'Filtra consignações por status.',
  })
  @IsOptional()
  @IsEnum(StatusConsignacao, {
    message: `O status da consignação deve ser um dos valores: ${Object.values(StatusConsignacao).join(', ')}.`,
  })
  status?: StatusConsignacao;

  @ApiPropertyOptional({
    enum: ['dataInclusao', 'revendedor'],
    description: 'Campo utilizado para ordenação.',
  })
  @IsOptional()
  @IsIn(['dataInclusao', 'revendedor'], {
    message: 'A ordenação deve ser por dataInclusao ou revendedor.',
  })
  ordenarPor?: 'dataInclusao' | 'revendedor' = 'dataInclusao';
}
