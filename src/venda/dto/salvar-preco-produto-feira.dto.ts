import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class SalvarPrecoProdutoFeiraDto {
  @Type(() => Number)
  @IsInt({ message: 'O produto deve ser um número inteiro.' })
  @Min(1, { message: 'O produto deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'O produto ultrapassa o limite permitido.',
  })
  idProduto!: number;

  @Type(() => Number)
  @IsInt({ message: 'O valor do produto deve ser informado em centavos.' })
  @Min(50, { message: 'O valor do produto deve ser de no mínimo R$ 0,50.' })
  @Max(1000000, {
    message: 'O valor do produto deve ser de no máximo R$ 10.000,00.',
  })
  valor!: number;
}
