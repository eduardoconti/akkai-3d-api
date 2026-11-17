import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';

export class ItemAlertaDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'Maria Souza' })
  titulo!: string;

  @ApiPropertyOptional({ example: 'Orçamento #12' })
  detalhe?: string;

  @ApiPropertyOptional({ example: '2026-11-10T14:30:00.000Z' })
  data?: string;
}

export class AlertaDto {
  @ApiProperty({ enum: TipoAlerta, example: TipoAlerta.ORCAMENTO_PENDENTE })
  tipo!: TipoAlerta;

  @ApiProperty({ enum: SeveridadeAlerta, example: SeveridadeAlerta.AVISO })
  severidade!: SeveridadeAlerta;

  @ApiProperty({ example: '3 orçamentos pendentes' })
  titulo!: string;

  @ApiProperty({
    example: 'Aguardando andamento, do mais antigo para o mais novo.',
  })
  descricao!: string;

  @ApiProperty({ example: 3 })
  quantidade!: number;

  @ApiProperty({ example: 'ORCAMENTO_PENDENTE:3:10,11,12' })
  chave!: string;

  @ApiProperty({ type: [ItemAlertaDto] })
  itens!: ItemAlertaDto[];
}

export class ListaAlertasDto {
  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ type: [AlertaDto] })
  alertas!: AlertaDto[];
}
