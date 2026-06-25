import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';
import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';

export const TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE = [
  TipoMovimentacaoEstoque.ENTRADA,
  TipoMovimentacaoEstoque.SAIDA,
];

export const ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE = Object.values(
  OrigemMovimentacaoEstoque,
).filter((origem) => origem !== OrigemMovimentacaoEstoque.VENDA);

function normalizarLista<T extends string>(
  value: unknown,
  valoresPadrao: T[],
): T[] {
  if (value === undefined || value === null || value === '') {
    return valoresPadrao;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean) as T[];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean) as T[];
  }

  return valoresPadrao;
}

export class PesquisarMovimentacoesEstoqueDto extends PesquisaPaginadaDto {
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data inicial deve estar em um formato de data válido.',
    },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'A data final deve estar em um formato de data válido.',
    },
  )
  dataFim?: string;

  @IsOptional()
  @Transform(({ value }) =>
    normalizarLista(value, TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE),
  )
  @IsArray({
    message: 'Os tipos devem ser informados em formato de lista.',
  })
  @IsEnum(TipoMovimentacaoEstoque, {
    each: true,
    message: 'Cada tipo informado deve ser entrada ou saída.',
  })
  tipos?: TipoMovimentacaoEstoque[] = TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE;

  @IsOptional()
  @Transform(({ value }) =>
    normalizarLista(value, ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE),
  )
  @IsArray({
    message: 'As origens devem ser informadas em formato de lista.',
  })
  @IsEnum(OrigemMovimentacaoEstoque, {
    each: true,
    message: 'Cada origem informada deve ser uma origem de estoque válida.',
  })
  origens?: OrigemMovimentacaoEstoque[] = ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O produto deve ser um número inteiro.' })
  @Min(1, { message: 'O produto deve ser maior que zero.' })
  idProduto?: number;
}
