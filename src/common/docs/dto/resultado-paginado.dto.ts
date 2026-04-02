import { ApiProperty } from '@nestjs/swagger';

export class ResultadoPaginadoDto {
  @ApiProperty({ example: 1, description: 'Página atual da consulta.' })
  pagina!: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade máxima de itens por página.',
  })
  tamanhoPagina!: number;

  @ApiProperty({
    example: 24,
    description: 'Quantidade total de registros encontrados.',
  })
  totalItens!: number;

  @ApiProperty({
    example: 3,
    description: 'Quantidade total de páginas disponíveis.',
  })
  totalPaginas!: number;
}
