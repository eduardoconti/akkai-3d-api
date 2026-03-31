import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ObterResumoVendasPeriodoDto,
  ResumoVendasPeriodoDto,
} from '@relatorio/dto';

type ResumoVendasPeriodoRow = {
  quantidadeItens: string | number;
  descontoTotal: string | number;
  valorTotal: string | number;
};

@Injectable()
export class RelatorioService {
  constructor(private readonly dataSource: DataSource) {}

  async obterResumoVendasPorPeriodo(
    filtro: ObterResumoVendasPeriodoDto,
  ): Promise<ResumoVendasPeriodoDto> {
    const dataInicio = filtro.dataInicio;
    const dataFim = filtro.dataFim ?? filtro.dataInicio;

    if (dataFim < dataInicio) {
      throw new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      );
    }

    const rows: ResumoVendasPeriodoRow[] = await this.dataSource.query(
      `
        SELECT
          COALESCE(
            (
              SELECT SUM(item.quantidade)
              FROM item_venda item
              INNER JOIN venda venda ON venda.id = item.id_venda
              WHERE venda.data_inclusao BETWEEN $1 AND $2
            ),
            0
          ) AS "quantidadeItens",
          (
            COALESCE(
              (
                SELECT SUM(venda.desconto)
                FROM venda venda
                WHERE venda.data_inclusao BETWEEN $1 AND $2
              ),
              0
            )
          ) AS "descontoTotal",
          COALESCE(
            (
              SELECT SUM(venda.valor_total)
              FROM venda venda
              WHERE venda.data_inclusao BETWEEN $1 AND $2
            ),
            0
          ) AS "valorTotal"
      `,
      [`${dataInicio} 00:00:00.000`, `${dataFim} 23:59:59.999`],
    );
    const row = rows[0];

    return {
      dataInicio: filtro.dataInicio,
      dataFim: filtro.dataFim ?? filtro.dataInicio,
      quantidadeItens: Number(row?.quantidadeItens ?? 0),
      descontoTotal: Number(row?.descontoTotal ?? 0),
      valorTotal: Number(row?.valorTotal ?? 0),
    };
  }
}
