import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { OrigemMovimentacaoEstoque } from '@produto/entities';

export class SaidaEstoqueDto {
  @Type(() => Number)
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser de no mínimo 1 unidade.' })
  @Max(10000, {
    message: 'A quantidade deve ser de no máximo 10.000 unidades por operação.',
  })
  quantidade!: number;

  @IsEnum(OrigemMovimentacaoEstoque, {
    message: 'A origem deve ser AJUSTE ou PERDA para saída de estoque.',
  })
  origem!: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA;
}
