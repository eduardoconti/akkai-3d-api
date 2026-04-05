import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MeioPagamento } from '@venda/entities';
import { trimStringValue } from '../../common/transforms/trim-string.transform';

export class InserirDespesaDto {
  @IsDateString(
    {},
    { message: 'A data da despesa deve estar em um formato válido.' },
  )
  dataLancamento!: string;

  @Transform(trimStringValue)
  @IsString({ message: 'A descrição da despesa deve ser um texto.' })
  @MinLength(2, {
    message: 'A descrição da despesa deve ter pelo menos 2 caracteres.',
  })
  @MaxLength(255, {
    message: 'A descrição da despesa deve ter no máximo 255 caracteres.',
  })
  descricao!: string;

  @Type(() => Number)
  @IsInt({ message: 'O valor da despesa deve ser informado em centavos.' })
  @Min(1, { message: 'O valor da despesa deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'O valor da despesa ultrapassa o limite permitido.',
  })
  valor!: number;

  @Type(() => Number)
  @IsInt({ message: 'A categoria da despesa deve ser um número inteiro.' })
  @Min(1, { message: 'A categoria da despesa deve ser maior que zero.' })
  idCategoria!: number;

  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento!: MeioPagamento;

  @Type(() => Number)
  @IsInt({ message: 'A carteira da despesa deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira da despesa deve ser maior que zero.' })
  idCarteira!: number;

  @IsOptional()
  @Transform(trimStringValue)
  @IsString({ message: 'A observação da despesa deve ser um texto.' })
  @MaxLength(500, {
    message: 'A observação da despesa deve ter no máximo 500 caracteres.',
  })
  observacao?: string;
}
