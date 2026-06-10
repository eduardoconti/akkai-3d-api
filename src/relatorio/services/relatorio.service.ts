import { BadRequestException, Injectable } from '@nestjs/common';
import { calcularOffset } from '@common/utils/paginacao.util';
import { DateService } from '@common/services/date.service';
import { DataSource } from 'typeorm';
import {
  DespesasCategoriasMesDashboardDto,
  ObterRelatorioProducaoDto,
  ObterResumoMensalDashboardDto,
  ObterProdutosMaisVendidosDto,
  ObterResumoVendasPeriodoDto,
  ObterSugestaoProducaoDto,
  ObterValorProdutosEstoqueDto,
  ProdutosMaisVendidosPeriodoDto,
  PrioridadeSugestaoProducao,
  RelatorioProducaoDto,
  RelatorioSugestaoProducaoDto,
  ResumoMensalDashboardDto,
  ResumoVendasPeriodoDto,
  SugestaoProducaoProdutoDto,
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
  codigo: string | number | null;
  nomeProduto: string;
  categoriaId: string | number | null;
  categoriaNome: string | null;
  quantidadeVendida: string | number;
};

type ValorProdutoEstoqueRow = {
  codigo: string | number;
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

type ProducaoProdutoRow = {
  codigo: string | number;
  nome: string;
  quantidadeProduzida: string | number;
  valorUnitario: string | number;
  valorEstimado: string | number;
};

type TotalizadoresRelatorioProducaoRow = {
  totalItens: string | number;
  totalQuantidadeProduzida: string | number | null;
  totalValorEstimado: string | number | null;
};

type SugestaoProducaoRow = {
  idProduto: string | number;
  codigo: string | number;
  nome: string;
  idCategoria: string | number | null;
  nomeCategoria: string | null;
  estoqueAtual: string | number;
  estoqueMinimo: string | number;
  quantidadeVendida: string | number;
  mediaVendaDiaria: string | number;
  demandaPlanejada: string | number;
  estoqueSeguranca: string | number;
  estoqueAlvo: string | number;
  diasCobertura: string | number | null;
  sugestaoProducao: string | number;
  prioridade: PrioridadeSugestaoProducao;
};

type TotalizadoresSugestaoProducaoRow = {
  totalItens: string | number;
  totalQuantidadeSugerida: string | number | null;
};

type DespesaCategoriaMesDashboardRow = {
  idCategoria: string | number | null;
  nomeCategoria: string | null;
  valorTotal: string | number;
};

type ResumoMensalDashboardRow = {
  mes: string | number;
  quantidadeItensVendidos: string | number | null;
  quantidadeBrindes: string | number | null;
  valorVendas: string | number | null;
  valorTaxas: string | number | null;
  valorImpostos: string | number | null;
  valorDespesas: string | number | null;
  saldo: string | number | null;
};

@Injectable()
export class RelatorioService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly dateService: DateService,
  ) {}

  async obterSugestaoProducao(
    filtro: ObterSugestaoProducaoDto,
  ): Promise<RelatorioSugestaoProducaoDto> {
    const dataFim = this.dateService.obterDataAtualLocal(new Date());
    const dataInicio = this.dateService.subtrairDiasDataLocal(
      dataFim,
      filtro.diasHistorico - 1,
    );
    const diasHistorico = filtro.diasHistorico;
    const rangeInicio = this.dateService.toUtcDateRange(dataInicio);
    const rangeFim = this.dateService.toUtcDateRange(dataFim);
    const offset = calcularOffset(filtro.pagina, filtro.tamanhoPagina);
    const orderByMap = {
      codigo: 'codigo',
      nome: 'nome',
      estoqueAtual: '"estoqueAtual"',
      quantidadeVendida: '"quantidadeVendida"',
      mediaVendaDiaria: '"mediaVendaDiaria"',
      diasCobertura: '"diasCobertura"',
      sugestaoProducao: '"sugestaoProducao"',
    } as const;
    const orderBy = orderByMap[filtro.ordenarPor ?? 'sugestaoProducao'];
    const orderDirection = filtro.direcao === 'asc' ? 'ASC' : 'DESC';
    const parametrosBase = [
      rangeInicio.start,
      rangeFim.end,
      diasHistorico,
      filtro.diasPlanejamento,
      filtro.diasEstoqueSeguranca,
    ];
    const consultaBase = this.criarConsultaBaseSugestaoProducao();

    const rows: SugestaoProducaoRow[] = await this.dataSource.query(
      `
        ${consultaBase}
        SELECT
          id_produto AS "idProduto",
          codigo,
          nome,
          id_categoria AS "idCategoria",
          nome_categoria AS "nomeCategoria",
          estoque_atual AS "estoqueAtual",
          estoque_minimo AS "estoqueMinimo",
          quantidade_vendida AS "quantidadeVendida",
          media_venda_diaria AS "mediaVendaDiaria",
          demanda_planejada AS "demandaPlanejada",
          estoque_seguranca AS "estoqueSeguranca",
          estoque_alvo AS "estoqueAlvo",
          dias_cobertura AS "diasCobertura",
          sugestao_producao AS "sugestaoProducao",
          prioridade
        FROM sugestoes
        WHERE sugestao_producao > 0
        ORDER BY ${orderBy} ${orderDirection} NULLS LAST, codigo ASC
        LIMIT $6
        OFFSET $7
      `,
      [...parametrosBase, filtro.tamanhoPagina, offset],
    );

    const totalizadores: TotalizadoresSugestaoProducaoRow[] =
      await this.dataSource.query(
        `
          ${consultaBase}
          SELECT
            COUNT(*)::int AS "totalItens",
            COALESCE(SUM(sugestao_producao), 0) AS "totalQuantidadeSugerida"
          FROM sugestoes
          WHERE sugestao_producao > 0
        `,
        parametrosBase,
      );

    const totais = totalizadores[0];
    const totalItens = Number(totais?.totalItens ?? 0);

    return {
      dataInicio,
      dataFim,
      diasHistorico,
      diasPlanejamento: filtro.diasPlanejamento,
      diasEstoqueSeguranca: filtro.diasEstoqueSeguranca,
      pagina: filtro.pagina,
      tamanhoPagina: filtro.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / filtro.tamanhoPagina)),
      totalQuantidadeSugerida: Number(totais?.totalQuantidadeSugerida ?? 0),
      itens: rows.map((row) => this.mapearSugestaoProducao(row)),
    };
  }

  async obterRelatorioProducao(
    filtro: ObterRelatorioProducaoDto,
  ): Promise<RelatorioProducaoDto> {
    const dataInicio = filtro.dataInicio;
    const dataFim = filtro.dataFim ?? filtro.dataInicio;

    if (dataFim < dataInicio) {
      throw new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      );
    }

    const rangeInicio = this.dateService.toUtcDateRange(dataInicio);
    const rangeFim = this.dateService.toUtcDateRange(dataFim);
    const offset = calcularOffset(filtro.pagina, filtro.tamanhoPagina);
    const orderByMap = {
      codigo: 'p.codigo',
      nome: 'p.nome',
      quantidadeProduzida: '"quantidadeProduzida"',
      valorEstimado: '"valorEstimado"',
    } as const;
    const orderBy = orderByMap[filtro.ordenarPor ?? 'quantidadeProduzida'];
    const orderDirection = filtro.direcao === 'asc' ? 'ASC' : 'DESC';
    const diasNoPeriodo =
      Math.floor(
        (Date.parse(`${dataFim}T00:00:00Z`) -
          Date.parse(`${dataInicio}T00:00:00Z`)) /
          86400000,
      ) + 1;

    const rows: ProducaoProdutoRow[] = await this.dataSource.query(
      `
        SELECT
          p.codigo AS codigo,
          p.nome AS nome,
          SUM(mov.quantidade) AS "quantidadeProduzida",
          p.valor AS "valorUnitario",
          SUM(mov.quantidade) * p.valor AS "valorEstimado"
        FROM movimentacao_estoque mov
        INNER JOIN produto p ON p.id = mov.id_produto
        WHERE mov.tipo = 'E'
          AND mov.origem = 'PRODUCAO'
          AND mov.data_inclusao BETWEEN $1 AND $2
        GROUP BY p.id, p.codigo, p.nome, p.valor
        ORDER BY ${orderBy} ${orderDirection}, p.codigo ASC
        LIMIT $3
        OFFSET $4
      `,
      [rangeInicio.start, rangeFim.end, filtro.tamanhoPagina, offset],
    );

    const totalizadores: TotalizadoresRelatorioProducaoRow[] =
      await this.dataSource.query(
        `
          SELECT
            COUNT(*)::int AS "totalItens",
            COALESCE(SUM(producoes."quantidadeProduzida"), 0) AS "totalQuantidadeProduzida",
            COALESCE(SUM(producoes."valorEstimado"), 0) AS "totalValorEstimado"
          FROM (
            SELECT
              p.id,
              SUM(mov.quantidade) AS "quantidadeProduzida",
              SUM(mov.quantidade) * p.valor AS "valorEstimado"
            FROM movimentacao_estoque mov
            INNER JOIN produto p ON p.id = mov.id_produto
            WHERE mov.tipo = 'E'
              AND mov.origem = 'PRODUCAO'
              AND mov.data_inclusao BETWEEN $1 AND $2
            GROUP BY p.id, p.valor
          ) producoes
        `,
        [rangeInicio.start, rangeFim.end],
      );

    const totais = totalizadores[0];
    const totalItens = Number(totais?.totalItens ?? 0);
    const totalQuantidadeProduzida = Number(
      totais?.totalQuantidadeProduzida ?? 0,
    );
    const totalValorEstimado = Number(totais?.totalValorEstimado ?? 0);

    return {
      dataInicio,
      dataFim,
      diasNoPeriodo,
      pagina: filtro.pagina,
      tamanhoPagina: filtro.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / filtro.tamanhoPagina)),
      totalQuantidadeProduzida,
      totalValorEstimado,
      mediaQuantidadePorDia:
        diasNoPeriodo > 0 ? totalQuantidadeProduzida / diasNoPeriodo : 0,
      mediaValorPorDia:
        diasNoPeriodo > 0 ? totalValorEstimado / diasNoPeriodo : 0,
      itens: rows.map((row) => {
        const quantidadeProduzida = Number(row.quantidadeProduzida ?? 0);
        const valorEstimado = Number(row.valorEstimado ?? 0);

        return {
          codigo: Number(row.codigo),
          nome: row.nome,
          quantidadeProduzida,
          valorUnitario: Number(row.valorUnitario ?? 0),
          valorEstimado,
          mediaQuantidadePorDia:
            diasNoPeriodo > 0 ? quantidadeProduzida / diasNoPeriodo : 0,
          mediaValorPorDia:
            diasNoPeriodo > 0 ? valorEstimado / diasNoPeriodo : 0,
        };
      }),
    };
  }

  private criarConsultaBaseSugestaoProducao(): string {
    return `
      WITH estoque AS (
        SELECT
          id_produto,
          SUM(
            CASE
              WHEN tipo = 'E' THEN quantidade
              WHEN tipo = 'S' THEN -quantidade
              ELSE 0
            END
          ) AS estoque_atual
        FROM movimentacao_estoque
        GROUP BY id_produto
      ),
      vendas AS (
        SELECT
          item.id_produto,
          SUM(item.quantidade) AS quantidade_vendida
        FROM item_venda item
        INNER JOIN venda v ON v.id = item.id_venda
        WHERE v.data_venda BETWEEN $1 AND $2
          AND item.brinde = false
          AND item.id_produto IS NOT NULL
        GROUP BY item.id_produto
      ),
      indicadores AS (
        SELECT
          p.id AS id_produto,
          p.codigo,
          p.nome,
          categoria.id AS id_categoria,
          categoria.nome AS nome_categoria,
          COALESCE(estoque.estoque_atual, 0) AS estoque_atual,
          COALESCE(p.estoque_minimo, 0) AS estoque_minimo,
          COALESCE(vendas.quantidade_vendida, 0) AS quantidade_vendida,
          COALESCE(vendas.quantidade_vendida, 0) / $3::numeric AS media_venda_diaria
        FROM produto p
        LEFT JOIN categoria_produto categoria ON categoria.id = p.id_categoria
        LEFT JOIN estoque ON estoque.id_produto = p.id
        LEFT JOIN vendas ON vendas.id_produto = p.id
        WHERE COALESCE(p.estoque_minimo, 0) > 0
      ),
      calculos AS (
        SELECT
          *,
          media_venda_diaria * $4::numeric AS demanda_planejada,
          media_venda_diaria * $5::numeric AS estoque_seguranca,
          GREATEST(
            media_venda_diaria * ($4::numeric + $5::numeric),
            estoque_minimo::numeric
          ) AS estoque_alvo,
          CASE
            WHEN media_venda_diaria > 0 THEN estoque_atual / media_venda_diaria
            ELSE NULL
          END AS dias_cobertura
        FROM indicadores
      ),
      sugestoes AS (
        SELECT
          *,
          GREATEST(CEIL(estoque_alvo - estoque_atual), 0)::int AS sugestao_producao,
          CASE
            WHEN media_venda_diaria > 0
              AND (estoque_atual <= 0 OR dias_cobertura <= 2)
              THEN 'CRITICO'
            ELSE 'PRODUZIR'
          END AS prioridade
        FROM calculos
        WHERE quantidade_vendida > 0 OR estoque_minimo > estoque_atual
      )
    `;
  }

  private mapearSugestaoProducao(
    row: SugestaoProducaoRow,
  ): SugestaoProducaoProdutoDto {
    return {
      idProduto: Number(row.idProduto),
      codigo: Number(row.codigo),
      nome: row.nome,
      categoria:
        row.idCategoria === null || row.nomeCategoria === null
          ? null
          : {
              id: Number(row.idCategoria),
              nome: row.nomeCategoria,
            },
      estoqueAtual: Number(row.estoqueAtual ?? 0),
      estoqueMinimo: Number(row.estoqueMinimo ?? 0),
      quantidadeVendida: Number(row.quantidadeVendida ?? 0),
      mediaVendaDiaria: this.arredondarNumero(row.mediaVendaDiaria),
      demandaPlanejada: this.arredondarNumero(row.demandaPlanejada),
      estoqueSeguranca: this.arredondarNumero(row.estoqueSeguranca),
      estoqueAlvo: this.arredondarNumero(row.estoqueAlvo),
      diasCobertura:
        row.diasCobertura === null
          ? null
          : this.arredondarNumero(row.diasCobertura),
      sugestaoProducao: Number(row.sugestaoProducao ?? 0),
      prioridade: row.prioridade,
    };
  }

  private calcularDiasPeriodo(dataInicio: string, dataFim: string): number {
    return (
      Math.floor(
        (Date.parse(`${dataFim}T00:00:00Z`) -
          Date.parse(`${dataInicio}T00:00:00Z`)) /
          86400000,
      ) + 1
    );
  }

  private arredondarNumero(valor: string | number | null): number {
    return Math.round(Number(valor ?? 0) * 100) / 100;
  }

  async obterResumoMensalDashboard(
    filtro: ObterResumoMensalDashboardDto,
  ): Promise<ResumoMensalDashboardDto> {
    const ano = filtro.ano ?? this.dateService.obterAnoMesAtualLocal().ano;
    const intervalosMeses = Array.from({ length: 12 }, (_, index) => ({
      mes: index + 1,
      intervalo: this.dateService.obterIntervaloUtcMes(ano, index + 1),
    }));
    const valoresMeses = intervalosMeses
      .map(
        ({ mes }, index) =>
          `(${mes}, $${index * 2 + 1}::timestamp, $${
            index * 2 + 2
          }::timestamp)`,
      )
      .join(', ');
    const parametrosMeses = intervalosMeses.flatMap(({ intervalo }) => [
      intervalo.start,
      intervalo.end,
    ]);

    const rows: ResumoMensalDashboardRow[] = await this.dataSource.query(
      `
        WITH meses(mes, data_inicio, data_fim) AS (
          VALUES ${valoresMeses}
        )
        SELECT
          meses.mes AS mes,
          COALESCE((
            SELECT SUM(item.quantidade)
            FROM venda
            INNER JOIN item_venda item ON item.id_venda = venda.id
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "quantidadeItensVendidos",
          COALESCE((
            SELECT SUM(CASE WHEN item.brinde = true THEN item.quantidade ELSE 0 END)
            FROM venda
            INNER JOIN item_venda item ON item.id_venda = venda.id
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "quantidadeBrindes",
          COALESCE((
            SELECT SUM(venda.valor_total)
            FROM venda
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "valorVendas",
          COALESCE((
            SELECT SUM(COALESCE(pagamento.valor_taxa, 0))
            FROM venda
            LEFT JOIN pagamento_venda pagamento ON pagamento.id_venda = venda.id
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "valorTaxas",
          COALESCE((
            SELECT SUM(COALESCE(pagamento.valor_imposto, 0))
            FROM venda
            LEFT JOIN pagamento_venda pagamento ON pagamento.id_venda = venda.id
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "valorImpostos",
          COALESCE((
            SELECT SUM(despesa.valor)
            FROM despesa
            WHERE despesa.data_lancamento BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS "valorDespesas",
          COALESCE((
            SELECT SUM(venda.valor_total)
            FROM venda
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) - COALESCE((
            SELECT SUM(COALESCE(pagamento.valor_taxa, 0))
            FROM venda
            LEFT JOIN pagamento_venda pagamento ON pagamento.id_venda = venda.id
            WHERE venda.data_venda BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) - COALESCE((
            SELECT SUM(despesa.valor)
            FROM despesa
            WHERE despesa.data_lancamento BETWEEN meses.data_inicio AND meses.data_fim
          ), 0) AS saldo
        FROM meses
        ORDER BY meses.mes ASC
      `,
      parametrosMeses,
    );

    const itens = rows.map((row) => ({
      mes: Number(row.mes),
      quantidadeItensVendidos: Number(row.quantidadeItensVendidos ?? 0),
      quantidadeBrindes: Number(row.quantidadeBrindes ?? 0),
      valorVendas: Number(row.valorVendas ?? 0),
      valorTaxas: Number(row.valorTaxas ?? 0),
      valorImpostos: Number(row.valorImpostos ?? 0),
      valorDespesas: Number(row.valorDespesas ?? 0),
      saldo: Number(row.saldo ?? 0),
    }));

    return {
      ano,
      totalQuantidadeItensVendidos: itens.reduce(
        (total, item) => total + item.quantidadeItensVendidos,
        0,
      ),
      totalQuantidadeBrindes: itens.reduce(
        (total, item) => total + item.quantidadeBrindes,
        0,
      ),
      totalVendas: itens.reduce((total, item) => total + item.valorVendas, 0),
      totalTaxas: itens.reduce((total, item) => total + item.valorTaxas, 0),
      totalImpostos: itens.reduce(
        (total, item) => total + item.valorImpostos,
        0,
      ),
      totalDespesas: itens.reduce(
        (total, item) => total + item.valorDespesas,
        0,
      ),
      saldo: itens.reduce((total, item) => total + item.saldo, 0),
      itens,
    };
  }

  async obterTopProdutosMesDashboard(): Promise<TopProdutosMesDashboardDto> {
    const { ano, mes } = this.dateService.obterAnoMesAtualLocal();
    const rangeMes = this.dateService.obterIntervaloUtcMes(ano, mes);

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
        WHERE v.data_venda BETWEEN $1 AND $2 AND item.brinde = false AND item.id_produto IS NOT NULL
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
      [rangeMes.start, rangeMes.end],
    );

    return {
      ano,
      mes,
      itens: rows.map((row) => ({
        idProduto:
          row.idProduto === null || row.idProduto === undefined
            ? null
            : Number(row.idProduto),
        codigo: row.codigo === null ? null : Number(row.codigo),
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
    const { ano, mes } = this.dateService.obterAnoMesAtualLocal();
    const rangeMes = this.dateService.obterIntervaloUtcMes(ano, mes);

    const rows: DespesaCategoriaMesDashboardRow[] = await this.dataSource.query(
      `
        SELECT
          categoria.id AS "idCategoria",
          COALESCE(categoria.nome, 'Sem categoria') AS "nomeCategoria",
          COALESCE(SUM(despesa.valor), 0) AS "valorTotal"
        FROM despesa
        LEFT JOIN categoria_despesa categoria ON categoria.id = despesa.id_categoria
        WHERE despesa.data_lancamento BETWEEN $1 AND $2
        GROUP BY categoria.id, categoria.nome
        ORDER BY SUM(despesa.valor) DESC, COALESCE(categoria.nome, 'Sem categoria') ASC
        LIMIT 5
      `,
      [rangeMes.start, rangeMes.end],
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
        codigo: Number(row.codigo),
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
    const conditions = [
      'v.data_venda BETWEEN $1 AND $2 AND item.brinde = false AND item.id_produto IS NOT NULL',
    ];

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
        GROUP BY
          item.id_produto,
          p.codigo,
          item.nome_produto,
          categoria.id,
          categoria.nome
        ORDER BY
          SUM(item.quantidade) DESC,
          item.nome_produto ASC,
          item.id_produto ASC,
          categoria.id ASC
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
        codigo: row.codigo === null ? null : Number(row.codigo),
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
    const conditions = ['venda.data_venda BETWEEN $1 AND $2'];

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
                - COALESCE((
                  SELECT SUM(COALESCE(pagamento.valor_taxa, 0) + COALESCE(pagamento.valor_imposto, 0))
                  FROM pagamento_venda pagamento
                  WHERE pagamento.id_venda = venda.id
                ), 0)
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
