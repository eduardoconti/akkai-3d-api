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
import { TransformarLista } from '@common/decorators/transformar-lista.decorator';
import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/enums';

export const TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE = [
  TipoMovimentacaoEstoque.ENTRADA,
  TipoMovimentacaoEstoque.SAIDA,
];

export const ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE = Object.values(
  OrigemMovimentacaoEstoque,
).filter((origem) => origem !== OrigemMovimentacaoEstoque.VENDA);

export class PesquisarMovimentacoesEstoqueDto extends PesquisaPaginadaDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data inicial deve estar em um formato de data válido.',
    },
  )
  dataInicio?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final deve estar em um formato de data válido.',
    },
  )
  dataFim?: string;

  @ApiPropertyOptional({ enum: TipoMovimentacaoEstoque, isArray: true })
  @IsOptional()
  @TransformarLista(TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE)
  @IsArray({
    message: 'Os tipos devem ser informados em formato de lista.',
  })
  @IsEnum(TipoMovimentacaoEstoque, {
    each: true,
    message: 'Cada tipo informado deve ser entrada ou saída.',
  })
  tipos?: TipoMovimentacaoEstoque[] = TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE;

  @ApiPropertyOptional({ enum: OrigemMovimentacaoEstoque, isArray: true })
  @IsOptional()
  @TransformarLista(ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE)
  @IsArray({
    message: 'As origens devem ser informadas em formato de lista.',
  })
  @IsEnum(OrigemMovimentacaoEstoque, {
    each: true,
    message: 'Cada origem informada deve ser uma origem de estoque válida.',
  })
  origens?: OrigemMovimentacaoEstoque[] = ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O produto deve ser um número inteiro.' })
  @Min(1, { message: 'O produto deve ser maior que zero.' })
  idProduto?: number;
}
