import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class ObterSugestaoProducaoDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Os dias de histórico devem ser um número inteiro.' })
  @Min(1, { message: 'Os dias de histórico devem ser maior que zero.' })
  @Max(365, {
    message: 'Os dias de histórico devem ser de no máximo 365 dias.',
  })
  diasHistorico = 28;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Os dias de planejamento devem ser um número inteiro.' })
  @Min(1, { message: 'Os dias de planejamento devem ser maior que zero.' })
  @Max(90, {
    message: 'Os dias de planejamento devem ser de no máximo 90 dias.',
  })
  diasPlanejamento = 7;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Os dias de estoque de segurança devem ser um número inteiro.',
  })
  @Min(0, {
    message: 'Os dias de estoque de segurança não podem ser negativos.',
  })
  @Max(30, {
    message: 'Os dias de estoque de segurança devem ser de no máximo 30 dias.',
  })
  diasEstoqueSeguranca = 2;

  @IsOptional()
  @IsIn(
    [
      'codigo',
      'nome',
      'estoqueAtual',
      'quantidadeVendida',
      'mediaVendaDiaria',
      'diasCobertura',
      'sugestaoProducao',
    ],
    {
      message:
        'A ordenação deve ser por codigo, nome, estoqueAtual, quantidadeVendida, mediaVendaDiaria, diasCobertura ou sugestaoProducao.',
    },
  )
  ordenarPor?:
    | 'codigo'
    | 'nome'
    | 'estoqueAtual'
    | 'quantidadeVendida'
    | 'mediaVendaDiaria'
    | 'diasCobertura'
    | 'sugestaoProducao' = 'sugestaoProducao';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'desc';
}
