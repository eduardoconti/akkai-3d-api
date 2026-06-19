import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PesquisaPaginadaDto } from '@common/dto/pesquisa-paginada.dto';

export class ObterSugestaoProducaoDto extends PesquisaPaginadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'As feiras de histórico devem ser um número inteiro.' })
  @Min(1, { message: 'As feiras de histórico devem ser maior que zero.' })
  @Max(365, {
    message: 'As feiras de histórico devem ser de no máximo 365.',
  })
  feirasHistorico = 8;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'As feiras de planejamento devem ser um número inteiro.' })
  @Min(1, { message: 'As feiras de planejamento devem ser maior que zero.' })
  @Max(90, {
    message: 'As feiras de planejamento devem ser de no máximo 90.',
  })
  feirasPlanejamento = 2;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'As feiras de estoque de segurança devem ser um número inteiro.',
  })
  @Min(0, {
    message: 'As feiras de estoque de segurança não podem ser negativas.',
  })
  @Max(30, {
    message: 'As feiras de estoque de segurança devem ser de no máximo 30.',
  })
  feirasEstoqueSeguranca = 1;

  @IsOptional()
  @IsIn(
    [
      'codigo',
      'nome',
      'estoqueAtual',
      'quantidadeVendida',
      'mediaVendaPorFeira',
      'feirasCobertura',
      'sugestaoProducao',
    ],
    {
      message:
        'A ordenação deve ser por codigo, nome, estoqueAtual, quantidadeVendida, mediaVendaPorFeira, feirasCobertura ou sugestaoProducao.',
    },
  )
  ordenarPor?:
    | 'codigo'
    | 'nome'
    | 'estoqueAtual'
    | 'quantidadeVendida'
    | 'mediaVendaPorFeira'
    | 'feirasCobertura'
    | 'sugestaoProducao' = 'sugestaoProducao';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc.',
  })
  direcao?: 'asc' | 'desc' = 'desc';
}
