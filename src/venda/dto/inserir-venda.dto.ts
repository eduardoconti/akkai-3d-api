import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento, TipoVenda } from '@venda/entities';

export class InserirVendaDto {
  @IsEnum(TipoVenda, {
    message: 'O tipo da venda deve ser FEIRA, LOJA ou ONLINE.',
  })
  tipo!: TipoVenda;

  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento!: MeioPagamento;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A feira da venda deve ser um número inteiro.' })
  @Min(1, { message: 'A feira da venda deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A feira da venda ultrapassa o limite permitido.',
  })
  idFeira?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O desconto da venda deve ser informado em centavos.' })
  @Min(0, { message: 'O desconto da venda não pode ser negativo.' })
  @Max(1000000, {
    message: 'O desconto da venda deve ser de no máximo R$ 10.000,00.',
  })
  desconto?: number;

  @IsArray({ message: 'Os itens da venda devem ser enviados em uma lista.' })
  @ArrayMinSize(1, {
    message: 'A venda deve possuir ao menos 1 item.',
  })
  @ArrayMaxSize(12, {
    message: 'A venda deve possuir no máximo 12 itens.',
  })
  @ValidateNested({ each: true })
  @Type(() => InserirItemVendaDto)
  itens!: InserirItemVendaDto[];
}

export class InserirItemVendaDto {
  @Type(() => Number)
  @IsInt({ message: 'O produto do item deve ser um número inteiro.' })
  @Min(1, { message: 'O produto do item deve ser maior que zero.' })
  idProduto!: number;

  @Type(() => Number)
  @IsInt({ message: 'A quantidade do item deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade do item deve ser de no mínimo 1 unidade.' })
  @Max(500, {
    message: 'A quantidade do item deve ser de no máximo 500 unidades.',
  })
  quantidade!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O desconto do item deve ser informado em centavos.' })
  @Min(0, { message: 'O desconto do item não pode ser negativo.' })
  @Max(1000000, {
    message: 'O desconto do item deve ser de no máximo R$ 10.000,00.',
  })
  desconto?: number;
}
