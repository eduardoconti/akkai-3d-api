import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import { TransformarListaNumerica } from '@common/decorators/transformar-lista.decorator';
import { TipoVenda } from '@venda/entities/venda.entity';

export class ObterProdutosMaisVendidosDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data inicial deve estar em um formato de data válido.',
    },
  )
  dataInicio!: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final deve estar em um formato de data válido.',
    },
  )
  dataFim?: string;

  @ApiPropertyOptional({ enum: TipoVenda })
  @IsOptional()
  @IsEnum(TipoVenda, {
    message: 'O tipo de venda informado é inválido.',
  })
  tipoVenda?: TipoVenda;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira deve ser um número inteiro.' })
  @Min(1, { message: 'A feira deve ser maior que zero.' })
  idFeira?: number;

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
}
