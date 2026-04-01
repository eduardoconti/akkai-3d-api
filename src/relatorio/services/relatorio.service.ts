import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ProdutosMaisVendidosPeriodoDto,
  ResumoVendasPeriodoDto,
} from '@relatorio/dto';
import { TipoVenda } from '@venda/entities/venda.entity';

type ResumoVendasPeriodoRow = {
  quantidadeItens: string | number;
  descontoTotal: string | number;
  valorTotal: string | number;
};

type ProdutoMaisVendidoRow = {
  idProduto: string | number | null;
  nomeProduto: string;
  categoriaId: string | number | null;
  categoriaNome: string | null;
  quantidadeVendida: string | number;
  descontoTotal: string | number;
  valorTotal: string | number;
};

@Injectable()
export class RelatorioService {
  constructor(private readonly dataSource: DataSource) {}

  async obterProdutosMaisVendidosPorPeriodo(
    filtro: ObterProdutosMaisVendidosDto,
  ): Promise<ProdutosMaisVendidosPeriodoDto> {
    const dataInicio = filtro.dataInicio;
    const dataFim = filtro.dataFim ?? filtro.dataInicio;

    if (dataFim < dataInicio) {
      throw new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      );
    }

    if (filtro.idFeira && filtro.tipoVenda !== TipoVenda.FEIRA) {
      throw new BadRequestException(
        'O filtro por feira só pode ser utilizado quando o tipo de venda for FEIRA.',
      );
    }

    const parameters: Array<string | number | number[]> = [
      `${dataInicio} 00:00:00.000`,
      `${dataFim} 23:59:59.999`,
    ];
    const conditions = ['v.data_inclusao BETWEEN $1 AND $2'];

    if (filtro.tipoVenda) {
      parameters.push(filtro.tipoVenda);
      conditions.push(`v.tipo = $${parameters.length}`);
    }

    if (filtro.idFeira) {
      parameters.push(filtro.idFeira);
      conditions.push(`v.id_feira = $${parameters.length}`);
    }

    if (filtro.idsCategorias && filtro.idsCategorias.length > 0) {
      parameters.push(filtro.idsCategorias);
      conditions.push(`p.id_categoria = ANY($${parameters.length})`);
    }

    const offset = (filtro.pagina - 1) * filtro.tamanhoPagina;

    const rows: ProdutoMaisVendidoRow[] = await this.dataSource.query(
      `
        SELECT
          item.id_produto AS "idProduto",
          item.nome_produto AS "nomeProduto",
          categoria.id AS "categoriaId",
          categoria.nome AS "categoriaNome",
          SUM(item.quantidade) AS "quantidadeVendida",
          SUM(item.desconto) AS "descontoTotal",
          SUM(item.valor_total) AS "valorTotal"
        FROM item_venda item
        INNER JOIN venda v ON v.id = item.id_venda
        LEFT JOIN produto p ON p.id = item.id_produto
        LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
        WHERE ${conditions.join(' AND ')}
        GROUP BY
          item.id_produto,
          item.nome_produto,
          categoria.id,
          categoria.nome
        ORDER BY
          SUM(item.quantidade) DESC,
          SUM(item.valor_total) DESC,
          item.nome_produto ASC
        LIMIT $${parameters.length + 1}
        OFFSET $${parameters.length + 2}
      `,
      [...parameters, filtro.tamanhoPagina, offset],
    );

    const totalRows: Array<{ totalItens: string | number }> =
      await this.dataSource.query(
        `
          SELECT COUNT(*)::int AS "totalItens"
          FROM (
            SELECT
              item.id_produto,
              item.nome_produto,
              categoria.id,
              categoria.nome
            FROM item_venda item
            INNER JOIN venda v ON v.id = item.id_venda
            LEFT JOIN produto p ON p.id = item.id_produto
            LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
            WHERE ${conditions.join(' AND ')}
            GROUP BY
              item.id_produto,
              item.nome_produto,
              categoria.id,
              categoria.nome
          ) ranking
        `,
        parameters,
      );
    const totalItens = Number(totalRows[0]?.totalItens ?? 0);

    return {
      dataInicio,
      dataFim,
      pagina: filtro.pagina,
      tamanhoPagina: filtro.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / filtro.tamanhoPagina)),
      itens: rows.map((row) => ({
        idProduto:
          row.idProduto === null || row.idProduto === undefined
            ? null
            : Number(row.idProduto),
        nomeProduto: row.nomeProduto,
        categoria:
          row.categoriaId === null || row.categoriaNome === null
            ? null
            : {
                id: Number(row.categoriaId),
                nome: row.categoriaNome,
              },
        quantidadeVendida: Number(row.quantidadeVendida),
        descontoTotal: Number(row.descontoTotal),
        valorTotal: Number(row.valorTotal),
      })),
    };
  }

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
