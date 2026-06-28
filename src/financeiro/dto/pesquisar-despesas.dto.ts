import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformarListaNumerica } from '@common/decorators/transformar-lista.decorator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class PesquisarDespesasDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data inicial da despesa deve estar em um formato válido.' },
  )
  dataInicio?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data final da despesa deve estar em um formato válido.' },
  )
  dataFim?: string;

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @TransformarListaNumerica()
  @IsArray({
    message: 'As categorias devem ser informadas em formato de lista.',
  })
  @IsInt({ each: true, message: 'Cada categoria deve ser um número inteiro.' })
  @Min(1, {
    each: true,
    message: 'Cada categoria deve ser maior que zero.',
  })
  idsCategorias?: number[];

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  idFeira?: number;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A carteira deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira deve ser maior que zero.' })
  idCarteira?: number;
}
