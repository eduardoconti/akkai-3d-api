import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export class ListarCarteiraDto {
  @ApiProperty({ example: 1, description: 'Identificador da carteira.' })
  id!: number;

  @ApiProperty({
    example: 'TON-BAU',
    description: 'Nome identificador da carteira financeira.',
  })
  nome!: string;

  @ApiProperty({
    example: true,
    description: 'Indica se a carteira está ativa.',
  })
  ativa!: boolean;

  @ApiProperty({
    example: 128500,
    description: 'Saldo atual da carteira em centavos.',
  })
  saldoAtual!: number;

  @ApiProperty({
    enum: MeioPagamento,
    isArray: true,
    example: ['PIX', 'CRE'],
    description: 'Meios de pagamento aceitos pela carteira.',
  })
  meiosPagamento!: MeioPagamento[];

  @ApiProperty({
    example: true,
    description:
      'Indica se as vendas desta carteira participam do cálculo de imposto.',
  })
  consideraImpostoVenda!: boolean;

  @ApiPropertyOptional({
    example: 4,
    nullable: true,
    description:
      'Percentual de imposto aplicado às vendas da carteira, quando configurado.',
  })
  percentualImpostoVenda!: number | null;
}
