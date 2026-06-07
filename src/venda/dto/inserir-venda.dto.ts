import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento, TipoVenda } from '@venda/entities';
import { trimStringValue } from '@common/transforms/trim-string.transform';

export class InserirVendaDto {
  @IsDateString(
    {},
    {
      message: 'A data da venda deve estar em um formato de data válido.',
    },
  )
  dataVenda!: string;

  @IsEnum(TipoVenda, {
    message: 'O tipo da venda deve ser FEIRA, LOJA, ONLINE ou CONSIGNACAO.',
  })
  tipo!: TipoVenda;

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
  @Max(50000, {
    message: 'O desconto da venda deve ser de no máximo R$ 500,00.',
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

  @IsArray({
    message: 'Os pagamentos da venda devem ser enviados em uma lista.',
  })
  @ArrayMinSize(1, {
    message: 'A venda deve possuir ao menos 1 pagamento.',
  })
  @ArrayMaxSize(2, {
    message: 'A venda deve possuir no máximo 2 pagamentos.',
  })
  @ValidateNested({ each: true })
  @Type(() => InserirPagamentoVendaDto)
  pagamentos!: InserirPagamentoVendaDto[];
}

export class InserirPagamentoVendaDto {
  @Type(() => Number)
  @IsInt({ message: 'A carteira do pagamento deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira do pagamento deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A carteira do pagamento ultrapassa o limite permitido.',
  })
  idCarteira!: number;

  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento!: MeioPagamento;

  @Type(() => Number)
  @IsInt({ message: 'O valor do pagamento deve ser informado em centavos.' })
  @Min(0, { message: 'O valor do pagamento não pode ser negativo.' })
  @Max(1000000, {
    message: 'O valor do pagamento deve ser de no máximo R$ 10.000,00.',
  })
  valor!: number;
}

export class InserirItemVendaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O produto do item deve ser um número inteiro.' })
  @Min(1, { message: 'O produto do item deve ser maior que zero.' })
  idProduto?: number;

  @ValidateIf((item: InserirItemVendaDto) => item.idProduto === undefined)
  @Transform(trimStringValue)
  @IsString({ message: 'O nome do item deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do item é obrigatório para item avulso.' })
  @MaxLength(120, {
    message: 'O nome do item deve ter no máximo 120 caracteres.',
  })
  nomeProduto?: string;

  @ValidateIf((item: InserirItemVendaDto) => item.idProduto === undefined)
  @Type(() => Number)
  @IsInt({
    message: 'O valor unitário do item avulso deve ser informado em centavos.',
  })
  @Min(0, { message: 'O valor unitário do item não pode ser negativo.' })
  @Max(100000, {
    message: 'O valor unitário do item deve ser de no máximo R$ 1.000,00.',
  })
  valorUnitario?: number;

  @Type(() => Number)
  @IsInt({ message: 'A quantidade do item deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade do item deve ser de no mínimo 1 unidade.' })
  @Max(500, {
    message: 'A quantidade do item deve ser de no máximo 500 unidades.',
  })
  quantidade!: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({
    message: 'O indicador de brinde do item deve ser verdadeiro ou falso.',
  })
  brinde?: boolean;
}
