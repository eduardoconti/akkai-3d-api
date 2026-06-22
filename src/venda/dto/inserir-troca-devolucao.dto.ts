import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { TipoItemTrocaDevolucao } from '@venda/entities';

export class InserirTrocaDevolucaoDto {
  @ApiProperty({
    example: '2026-06-22T10:00:00.000Z',
    description: 'Data em que a troca/devolução foi realizada.',
  })
  @IsDateString(
    {},
    {
      message:
        'A data da troca/devolução deve estar em um formato de data válido.',
    },
  )
  dataTrocaDevolucao!: string;

  @ApiProperty({
    type: () => [InserirItemTrocaDevolucaoDto],
    description: 'Itens devolvidos e itens entregues na troca.',
  })
  @IsArray({
    message: 'Os itens da troca/devolução devem ser enviados em uma lista.',
  })
  @ArrayMinSize(1, {
    message: 'A troca/devolução deve possuir ao menos 1 item.',
  })
  @ArrayMaxSize(20, {
    message: 'A troca/devolução deve possuir no máximo 20 itens.',
  })
  @ValidateNested({ each: true })
  @Type(() => InserirItemTrocaDevolucaoDto)
  itens!: InserirItemTrocaDevolucaoDto[];

  @ApiPropertyOptional({
    example: 1,
    description:
      'Carteira usada para registrar a diferença financeira, quando houver.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A carteira deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'A carteira ultrapassa o limite permitido.',
  })
  idCarteira?: number;

  @ApiPropertyOptional({
    enum: MeioPagamento,
    description:
      'Meio de pagamento usado para registrar a diferença financeira.',
  })
  @IsOptional()
  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento?: MeioPagamento;

  @ApiPropertyOptional({
    example: 'Cliente trocou por produto de outro tamanho.',
    description: 'Observação livre sobre a troca/devolução.',
  })
  @IsOptional()
  @IsString({ message: 'A observação deve ser um texto.' })
  @MaxLength(500, {
    message: 'A observação deve ter no máximo 500 caracteres.',
  })
  observacao?: string;
}

export class InserirItemTrocaDevolucaoDto {
  @ApiProperty({
    example: 1,
    description: 'Produto devolvido ou entregue.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O produto do item deve ser um número inteiro.' })
  @Min(1, { message: 'O produto do item deve ser maior que zero.' })
  @Max(2147483647, {
    message: 'O produto do item ultrapassa o limite permitido.',
  })
  idProduto!: number;

  @ApiProperty({
    enum: TipoItemTrocaDevolucao,
    description: 'Indica se o produto voltou para o estoque ou saiu na troca.',
  })
  @IsEnum(TipoItemTrocaDevolucao, {
    message: 'O tipo do item deve ser DEVOLVIDO ou ENTREGUE.',
  })
  tipo!: TipoItemTrocaDevolucao;

  @ApiProperty({
    example: 2,
    description: 'Quantidade do produto.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade do item deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade do item deve ser de no mínimo 1 unidade.' })
  @Max(500, {
    message: 'A quantidade do item deve ser de no máximo 500 unidades.',
  })
  quantidade!: number;

  @ApiProperty({
    example: 3500,
    description: 'Valor unitário do produto em centavos.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O valor unitário deve ser informado em centavos.' })
  @Min(0, { message: 'O valor unitário não pode ser negativo.' })
  @Max(100000, {
    message: 'O valor unitário deve ser de no máximo R$ 1.000,00.',
  })
  valorUnitario!: number;
}
