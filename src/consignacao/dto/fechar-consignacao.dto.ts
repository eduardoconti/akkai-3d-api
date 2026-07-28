import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class FecharItemConsignacaoDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do item da consignação.',
  })
  @Type(() => Number)
  @IsInt({ message: 'O item da consignação deve ser um número inteiro.' })
  @Min(1, { message: 'O item da consignação deve ser maior que zero.' })
  idItem!: number;

  @ApiProperty({
    example: 2,
    description:
      'Quantidade vendida no fechamento. O saldo restante será devolvido.',
  })
  @Type(() => Number)
  @IsInt({ message: 'A quantidade vendida deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade vendida não pode ser negativa.' })
  quantidadeVendida!: number;
}

export class FecharConsignacaoDto {
  @ApiProperty({
    type: [FecharItemConsignacaoDto],
    description: 'Destino do saldo de todos os itens abertos da consignação.',
  })
  @IsArray({ message: 'Os itens do fechamento devem ser uma lista.' })
  @ArrayMinSize(1, {
    message: 'Informe pelo menos um item para fechar a consignação.',
  })
  @ValidateNested({ each: true })
  @Type(() => FecharItemConsignacaoDto)
  itens!: FecharItemConsignacaoDto[];

  @ApiPropertyOptional({
    example: 1,
    description: 'Carteira que receberá o valor dos itens vendidos.',
  })
  @ValidateIf((input: FecharConsignacaoDto) =>
    input.itens?.some((item) => item.quantidadeVendida > 0),
  )
  @Type(() => Number)
  @IsInt({ message: 'A carteira do pagamento deve ser um número inteiro.' })
  @Min(1, { message: 'A carteira do pagamento deve ser maior que zero.' })
  idCarteira?: number;

  @ApiPropertyOptional({
    enum: MeioPagamento,
    example: MeioPagamento.PIX,
    description: 'Meio de pagamento utilizado nos itens vendidos.',
  })
  @ValidateIf((input: FecharConsignacaoDto) =>
    input.itens?.some((item) => item.quantidadeVendida > 0),
  )
  @IsEnum(MeioPagamento, {
    message: 'O meio de pagamento deve ser DIN, DEB, CRE ou PIX.',
  })
  meioPagamento?: MeioPagamento;
}
