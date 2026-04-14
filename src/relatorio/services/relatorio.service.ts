import { BadRequestException, Injectable } from '@nestjs/common';
import { calcularOffset } from '@common/utils/paginacao.util';
import { DateService } from '@common/services/date.service';
import { DataSource } from 'typeorm';
import {
  DespesasCategoriasMesDashboardDto,
  ObterResumoMensalDashboardDto,
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ObterValorProdutosEstoqueDto,
  ProdutosMaisVendidosPeriodoDto,
  ResumoMensalDashboardDto,
  ResumoVendasPeriodoDto,
  TopProdutosMesDashboardDto,
  ValorProdutosEstoqueDto,
} from '@relatorio/dto';
import { TipoVenda } from '@venda/entities/venda.entity';

type ResumoVendasPeriodoRow = {
  quantidadeItens: string | number;
  descontoTotal: string | number;
  valorTotal: string | number;
  valorLiquido: string | number;
};

type ProdutoMaisVendidoRow = {
  idProduto: string | number | null;
  codigo: string | null;
  nomeProduto: string;
  categoriaId: string | number | null;
  categoriaNome: string | null;
  quantidadeVendida: string | number;
};

type ValorProdutoEstoqueRow = {
  codigo: string;
  nome: string;
  quantidade: string | number;
  valor: string | number;
  valorTotal: string | number;
};

type TotalizadoresValorProdutosEstoqueRow = {
  totalItens: string | number;
  totalQuantidade: string | number | null;
  totalValor: string | number | null;
  totalValorTotal: string | number | null;
};

type DespesaCategoriaMesDashboardRow = {
  idCategoria: string | number | null;
  nomeCategoria: string | null;
  valorTotal: string | number;
};

type ResumoMensalDashboardRow = {
  mes: string | number;
  quantidadeItensVendidos: string | number | null;
  valorVendas: string | number | null;
  valorDespesas: string | number | null;
  saldo: string | number | null;
};

@Injectable()
export class RelatorioService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly dateService: DateService,
  ) {}

  async obterResumoMensalDashboard(
    filtro: ObterResumoMensalDashboardDto,
  ): Promise<ResumoMensalDashboardDto> {
    const ano = filtro.ano ?? new Date().getFullYear();

    const rows: ResumoMensalDashboardRow[] = await this.dataSource.query(
      `
        WITH meses AS (
          SELECT generate_series(1, 12) AS mes
        ),
        vendas AS (
          SELECT
            EXTRACT(MONTH FROM venda.data_inclusao)::int AS mes,
            COALESCE(SUM(venda.valor_total), 0) AS "valorVendas"
          FROM venda
          WHERE EXTRACT(YEAR FROM venda.data_inclusao) = $1
          GROUP BY EXTRACT(MONTH FROM venda.data_inclusao)
        ),
        itens_vendidos AS (
          SELECT
            EXTRACT(MONTH FROM venda.data_inclusao)::int AS mes,
            COALESCE(SUM(item.quantidade), 0) AS "quantidadeItensVendidos"
          FROM venda
          INNER JOIN item_venda item ON item.id_venda = venda.id
          WHERE EXTRACT(YEAR FROM venda.data_inclusao) = $1
          AND item.brinde = false
          GROUP BY EXTRACT(MONTH FROM venda.data_inclusao)
        ),
        despesas AS (
          SELECT
            EXTRACT(MONTH FROM data_lancamento)::int AS mes,
            COALESCE(SUM(valor), 0) AS "valorDespesas"
          FROM despesa
          WHERE EXTRACT(YEAR FROM data_lancamento) = $1
          GROUP BY EXTRACT(MONTH FROM data_lancamento)
        )
        SELECT
          meses.mes AS mes,
          COALESCE(itens_vendidos."quantidadeItensVendidos", 0) AS "quantidadeItensVendidos",
          COALESCE(vendas."valorVendas", 0) AS "valorVendas",
          COALESCE(despesas."valorDespesas", 0) AS "valorDespesas",
          COALESCE(vendas."valorVendas", 0) - COALESCE(despesas."valorDespesas", 0) AS saldo
        FROM meses
        LEFT JOIN vendas ON vendas.mes = meses.mes
        LEFT JOIN itens_vendidos ON itens_vendidos.mes = meses.mes
        LEFT JOIN despesas ON despesas.mes = meses.mes
        ORDER BY meses.mes ASC
      `,
      [ano],
    );

    const itens = rows.map((row) => ({
      mes: Number(row.mes),
      quantidadeItensVendidos: Number(row.quantidadeItensVendidos ?? 0),
      valorVendas: Number(row.valorVendas ?? 0),
      valorDespesas: Number(row.valorDespesas ?? 0),
      saldo: Number(row.saldo ?? 0),
    }));

    return {
      ano,
      totalQuantidadeItensVendidos: itens.reduce(
        (total, item) => total + item.quantidadeItensVendidos,
        0,
      ),
      totalVendas: itens.reduce((total, item) => total + item.valorVendas, 0),
      totalDespesas: itens.reduce(
        (total, item) => total + item.valorDespesas,
        0,
      ),
      saldo: itens.reduce((total, item) => total + item.saldo, 0),
      itens,
    };
  }

  async obterTopProdutosMesDashboard(): Promise<TopProdutosMesDashboardDto> {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth() + 1;

    const rows: ProdutoMaisVendidoRow[] = await this.dataSource.query(
      `
        SELECT
          item.id_produto AS "idProduto",
          p.codigo AS codigo,
          item.nome_produto AS "nomeProduto",
          categoria.id AS "categoriaId",
          categoria.nome AS "categoriaNome",
          SUM(item.quantidade) AS "quantidadeVendida"
        FROM item_venda item
        INNER JOIN venda v ON v.id = item.id_venda
        LEFT JOIN produto p ON p.id = item.id_produto
        LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
        WHERE EXTRACT(YEAR FROM v.data_inclusao) = $1
          AND EXTRACT(MONTH FROM v.data_inclusao) = $2
          AND item.brinde = false
        GROUP BY
          item.id_produto,
          p.codigo,
          item.nome_produto,
          categoria.id,
          categoria.nome
        ORDER BY
          SUM(item.quantidade) DESC,
          item.nome_produto ASC
        LIMIT 5
      `,
      [ano, mes],
    );

    return {
      ano,
      mes,
      itens: rows.map((row) => ({
        idProduto:
          row.idProduto === null || row.idProduto === undefined
            ? null
            : Number(row.idProduto),
        codigo: row.codigo,
        nomeProduto: row.nomeProduto,
        categoria:
          row.categoriaId === null || row.categoriaNome === null
            ? null
            : {
                id: Number(row.categoriaId),
                nome: row.categoriaNome,
              },
        quantidadeVendida: Number(row.quantidadeVendida),
      })),
    };
  }

  async obterDespesasCategoriasMesDashboard(): Promise<DespesasCategoriasMesDashboardDto> {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth() + 1;

    const rows: DespesaCategoriaMesDashboardRow[] = await this.dataSource.query(
      `
        SELECT
          categoria.id AS "idCategoria",
          COALESCE(categoria.nome, 'Sem categoria') AS "nomeCategoria",
          COALESCE(SUM(despesa.valor), 0) AS "valorTotal"
        FROM despesa
        LEFT JOIN categoria_despesa categoria ON categoria.id = despesa.id_categoria
        WHERE EXTRACT(YEAR FROM despesa.data_lancamento) = $1
          AND EXTRACT(MONTH FROM despesa.data_lancamento) = $2
        GROUP BY categoria.id, categoria.nome
        ORDER BY SUM(despesa.valor) DESC, COALESCE(categoria.nome, 'Sem categoria') ASC
        LIMIT 5
      `,
      [ano, mes],
    );

    return {
      ano,
      mes,
      itens: rows.map((row) => ({
        idCategoria:
          row.idCategoria === null || row.idCategoria === undefined
            ? null
            : Number(row.idCategoria),
        nomeCategoria: row.nomeCategoria ?? 'Sem categoria',
        valorTotal: Number(row.valorTotal),
      })),
    };
  }

  async obterValorProdutosEstoque(
    filtro: ObterValorProdutosEstoqueDto,
  ): Promise<ValorProdutosEstoqueDto> {
    const offset = calcularOffset(filtro.pagina, filtro.tamanhoPagina);
    const orderByMap = {
      codigo: 'p.codigo',
      nome: 'p.nome',
      quantidade: 'COALESCE(e.quantidade_estoque, 0)',
      valor: 'p.valor',
      valorTotal: 'COALESCE(e.quantidade_estoque, 0) * p.valor',
    } as const;
    const orderBy = orderByMap[filtro.ordenarPor ?? 'codigo'];
    const orderDirection = filtro.direcao === 'desc' ? 'DESC' : 'ASC';

    const rows: ValorProdutoEstoqueRow[] = await this.dataSource.query(
      `
        WITH estoque AS (
          SELECT
            id_produto,
            SUM(
              CASE
                WHEN tipo = 'E' THEN quantidade
                WHEN tipo = 'S' THEN -quantidade
                ELSE 0
              END
            ) AS quantidade_estoque
          FROM movimentacao_estoque
          GROUP BY id_produto
        )
        SELECT
          p.codigo AS codigo,
          p.nome AS nome,
          COALESCE(e.quantidade_estoque, 0) AS quantidade,
          p.valor AS valor,
          COALESCE(e.quantidade_estoque, 0) * p.valor AS "valorTotal"
        FROM produto p
        LEFT JOIN estoque e ON e.id_produto = p.id
        WHERE COALESCE(e.quantidade_estoque, 0) > 0
        ORDER BY ${orderBy} ${orderDirection}, p.codigo ASC
        LIMIT $1
        OFFSET $2
      `,
      [filtro.tamanhoPagina, offset],
    );

    const totalizadores: TotalizadoresValorProdutosEstoqueRow[] =
      await this.dataSource.query(
        `
          WITH estoque AS (
            SELECT
              id_produto,
              SUM(
                CASE
                  WHEN tipo = 'E' THEN quantidade
                  WHEN tipo = 'S' THEN -quantidade
                  ELSE 0
                END
              ) AS quantidade_estoque
            FROM movimentacao_estoque
            GROUP BY id_produto
          )
          SELECT
            COUNT(*)::int AS "totalItens",
            COALESCE(SUM(COALESCE(e.quantidade_estoque, 0)), 0) AS "totalQuantidade",
            COALESCE(SUM(p.valor), 0) AS "totalValor",
            COALESCE(SUM(COALESCE(e.quantidade_estoque, 0) * p.valor), 0) AS "totalValorTotal"
          FROM produto p
          LEFT JOIN estoque e ON e.id_produto = p.id
          WHERE COALESCE(e.quantidade_estoque, 0) > 0
        `,
      );

    const totais = totalizadores[0];
    const totalItens = Number(totais?.totalItens ?? 0);

    return {
      pagina: filtro.pagina,
      tamanhoPagina: filtro.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / filtro.tamanhoPagina)),
      totalQuantidade: Number(totais?.totalQuantidade ?? 0),
      totalValor: Number(totais?.totalValor ?? 0),
      totalValorTotal: Number(totais?.totalValorTotal ?? 0),
      itens: rows.map((row) => ({
        codigo: row.codigo,
        nome: row.nome,
        quantidade: Number(row.quantidade),
        valor: Number(row.valor),
        valorTotal: Number(row.valorTotal),
      })),
    };
  }

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

    const rangeInicio = this.dateService.toUtcDateRange(dataInicio);
    const rangeFim = this.dateService.toUtcDateRange(dataFim);

    const parameters: Array<string | number | number[]> = [
      rangeInicio.start,
      rangeFim.end,
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

    const offset = calcularOffset(filtro.pagina, filtro.tamanhoPagina);

    const rows: ProdutoMaisVendidoRow[] = await this.dataSource.query(
      `
        SELECT
          item.id_produto AS "idProduto",
          p.codigo AS codigo,
          item.nome_produto AS "nomeProduto",
          categoria.id AS "categoriaId",
          categoria.nome AS "categoriaNome",
          SUM(item.quantidade) AS "quantidadeVendida"
        FROM item_venda item
        INNER JOIN venda v ON v.id = item.id_venda
        LEFT JOIN produto p ON p.id = item.id_produto
        LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
        WHERE ${conditions.join(' AND ')}
          AND item.brinde = false
        GROUP BY
          item.id_produto,
          p.codigo,
          item.nome_produto,
          categoria.id,
          categoria.nome
        ORDER BY
          SUM(item.quantidade) DESC,
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
              p.codigo,
              item.nome_produto,
              categoria.id,
              categoria.nome
            FROM item_venda item
            INNER JOIN venda v ON v.id = item.id_venda
            LEFT JOIN produto p ON p.id = item.id_produto
            LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
            WHERE ${conditions.join(' AND ')}
              AND item.brinde = false
            GROUP BY
              item.id_produto,
              p.codigo,
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
        codigo: row.codigo,
        nomeProduto: row.nomeProduto,
        categoria:
          row.categoriaId === null || row.categoriaNome === null
            ? null
            : {
                id: Number(row.categoriaId),
                nome: row.categoriaNome,
              },
        quantidadeVendida: Number(row.quantidadeVendida),
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

    if (filtro.idFeira && filtro.tipoVenda !== TipoVenda.FEIRA) {
      throw new BadRequestException(
        'O filtro por feira só pode ser utilizado quando o tipo de venda for FEIRA.',
      );
    }

    const rangeInicio = this.dateService.toUtcDateRange(dataInicio);
    const rangeFim = this.dateService.toUtcDateRange(dataFim);

    const parameters: Array<string | number> = [
      rangeInicio.start,
      rangeFim.end,
    ];
    const conditions = ['venda.data_inclusao BETWEEN $1 AND $2'];

    if (filtro.tipoVenda) {
      parameters.push(filtro.tipoVenda);
      conditions.push(`venda.tipo = $${parameters.length}`);
    }

    if (filtro.idFeira) {
      parameters.push(filtro.idFeira);
      conditions.push(`venda.id_feira = $${parameters.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const rows: ResumoVendasPeriodoRow[] = await this.dataSource.query(
      `
        SELECT
          COALESCE(
            (
              SELECT SUM(item.quantidade)
              FROM item_venda item
              INNER JOIN venda venda ON venda.id = item.id_venda
              WHERE ${whereClause}
                AND item.brinde = false
            ),
            0
          ) AS "quantidadeItens",
          COALESCE(
            (
              SELECT SUM(venda.desconto)
              FROM venda venda
              WHERE ${whereClause}
            ),
            0
          ) AS "descontoTotal",
          COALESCE(
            (
              SELECT SUM(venda.valor_total)
              FROM venda venda
              WHERE ${whereClause}
            ),
            0
          ) AS "valorTotal",
          COALESCE(
            (
              SELECT SUM(
                venda.valor_total
                - COALESCE(venda.valor_taxa, 0)
                - COALESCE(venda.valor_imposto, 0)
              )
              FROM venda venda
              WHERE ${whereClause}
            ),
            0
          ) AS "valorLiquido"
      `,
      parameters,
    );
    const row = rows[0];

    return {
      dataInicio: filtro.dataInicio,
      dataFim: filtro.dataFim ?? filtro.dataInicio,
      quantidadeItens: Number(row?.quantidadeItens ?? 0),
      descontoTotal: Number(row?.descontoTotal ?? 0),
      valorTotal: Number(row?.valorTotal ?? 0),
      valorLiquido: Number(row?.valorLiquido ?? 0),
    };
  }
}
