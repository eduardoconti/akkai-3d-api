import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class InserirTaxaMeioPagamentoCarteiraDto {
  @Type(() => Number)
  @IsInt({ message: 'A carteira deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira deve ser maior que zero.' })
  idCarteira!: number;

  @IsEnum(MeioPagamento, {
    message: `O meio de pagamento deve ser um dos valores: ${Object.values(MeioPagamento).join(', ')}.`,
  })
  meioPagamento!: MeioPagamento;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O percentual da taxa deve ser um número válido.' },
  )
  @Min(0, { message: 'O percentual da taxa não pode ser negativo.' })
  @Max(100, { message: 'O percentual da taxa deve ser de no máximo 100.' })
  percentual!: number;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativa deve ser verdadeiro ou falso.' })
  ativa?: boolean;
}
