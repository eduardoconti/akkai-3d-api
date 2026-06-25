import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Produto, StatusProduto } from '@produto/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DetalheProdutoDto,
  ListarProdutoDto,
  PesquisarProdutosDto,
} from '@produto/dto';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class ProdutoService {
  private readonly logger = new Logger(ProdutoService.name);

  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async listarProdutos(
    pesquisa: PesquisarProdutosDto,
  ): Promise<ResultadoPaginado<ListarProdutoDto>> {
    const termo = pesquisa.termo?.toLowerCase();
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const orderByMap = {
      codigo: 'p.codigo',
      nome: 'p.nome',
      nivelEstoque: 'COALESCE(e.quantidade_estoque, 0)',
    } as const;
    const orderBy = orderByMap[pesquisa.ordenarPor ?? 'nome'];
    const orderDirection = pesquisa.direcao === 'desc' ? 'DESC' : 'ASC';
    const filtros: string[] = [];
    const parametros: unknown[] = [];

    if (termo) {
      parametros.push(`%${termo}%`);
      filtros.push(`
        (
          LOWER(p.nome) LIKE $${parametros.length}
          OR p.codigo::text LIKE $${parametros.length}
          OR LOWER(COALESCE(p.descricao, '')) LIKE $${parametros.length}
          OR LOWER(c.nome) LIKE $${parametros.length}
        )
      `);
    }

    if (pesquisa.idsCategorias && pesquisa.idsCategorias.length > 0) {
      parametros.push(pesquisa.idsCategorias);
      filtros.push(`p.id_categoria = ANY($${parametros.length})`);
    }

    const whereClause =
      filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

    const contagem = await this.dataSource.query<Array<{ total: string }>>(
      `
        SELECT COUNT(*) AS total
        FROM produto p
        INNER JOIN categoria_produto c ON c.id = p.id_categoria
        ${whereClause}
      `,
      parametros,
    );

    parametros.push(pesquisa.tamanhoPagina);
    parametros.push(offset);

    const produtos = await this.dataSource.query<
      Array<{
        id: string;
        nome: string;
        codigo: string | number;
        descricao: string | null;
        estoque_minimo: string | null;
        id_categoria: string;
        valor: string;
        status: StatusProduto;
        categoria_id: string;
        categoria_nome: string;
        quantidade_estoque: string | null;
      }>
    >(
      `
       WITH produtos_base AS (
         SELECT
           p.id,
           p.nome,
           p.codigo,
           p.descricao,
           p.estoque_minimo,
           p.id_categoria,
           p.valor,
           p.status,
           c.id AS categoria_id,
           c.nome AS categoria_nome
         FROM produto p
         INNER JOIN categoria_produto c ON c.id = p.id_categoria
         ${whereClause}
       ),
       estoque AS (
         SELECT
           me.id_produto,
           SUM(
             CASE
               WHEN me.tipo = 'E' THEN me.quantidade
               WHEN me.tipo = 'S' THEN -me.quantidade
               ELSE 0
             END
           ) AS quantidade_estoque
         FROM movimentacao_estoque me
         INNER JOIN produtos_base p ON p.id = me.id_produto
         GROUP BY me.id_produto
       ),
       produtos_filtrados AS (
         SELECT
           p.id,
           p.nome,
           p.codigo,
           p.descricao,
           p.estoque_minimo,
           p.id_categoria,
           p.valor,
           p.status,
           p.categoria_id,
           p.categoria_nome,
           COALESCE(e.quantidade_estoque, 0) AS quantidade_estoque,
           ROW_NUMBER() OVER (ORDER BY ${orderBy} ${orderDirection}, p.nome ASC) AS ordem
         FROM produtos_base p
         LEFT JOIN estoque e ON e.id_produto = p.id
       ),
       produtos_paginados AS (
         SELECT *
         FROM produtos_filtrados
         ORDER BY ordem
         LIMIT $${parametros.length - 1}
         OFFSET $${parametros.length}
       )
       SELECT
         p.id,
         p.nome,
         p.codigo,
         p.descricao,
         p.estoque_minimo,
         p.id_categoria,
         p.valor,
         p.status,
         p.categoria_id,
         p.categoria_nome,
         p.quantidade_estoque
       FROM produtos_paginados p
       ORDER BY p.ordem
      `,
      parametros,
    );

    return {
      itens: produtos.map((produto) => ({
        id: Number(produto.id),
        nome: produto.nome,
        codigo: Number(produto.codigo),
        descricao: produto.descricao ?? undefined,
        estoqueMinimo:
          produto.estoque_minimo === null
            ? undefined
            : Number(produto.estoque_minimo),
        idCategoria: Number(produto.id_categoria),
        valor: Number(produto.valor),
        status: produto.status,
        quantidadeEstoque: Number(produto.quantidade_estoque ?? 0),
        categoria: {
          id: Number(produto.categoria_id),
          nome: produto.categoria_nome,
        },
      })),
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens: Number(contagem[0]?.total ?? 0),
      totalPaginas: Math.max(
        1,
        Math.ceil(Number(contagem[0]?.total ?? 0) / pesquisa.tamanhoPagina),
      ),
    };
  }

  async salvar(produto: Produto): Promise<Produto> {
    return this.produtoRepository.save(produto).catch((error: unknown) => {
      this.logger.error('Erro ao salvar produto', error);
      lancarExcecaoConflito(
        error,
        `Código ${produto.codigo} já existe`,
        'Erro ao salvar produto',
      );
    });
  }

  async obterProdutoPorId(id: number): Promise<Produto | null> {
    return this.produtoRepository.findOne({ where: { id } });
  }

  async garantirExisteProduto(id: number): Promise<Produto> {
    const produto = await this.obterProdutoPorId(id);
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return produto;
  }

  async existeProduto(idProduto: number): Promise<boolean> {
    return this.produtoRepository.exists({ where: { id: idProduto } });
  }

  async obterDetalheProdutoPorId(id: number): Promise<DetalheProdutoDto> {
    const produto = await this.produtoRepository.findOne({
      where: { id },
      relations: { categoria: true },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const estoque = await this.dataSource.query<[{ total: number }]>(
      `
  SELECT SUM(CASE WHEN tipo = 'E' THEN quantidade ELSE -quantidade END) as total
  FROM movimentacao_estoque
  WHERE id_produto = $1
`,
      [id],
    );

    const quantidadeEstoque = Number(estoque[0]?.total || 0);

    return {
      ...produto,
      quantidadeEstoque,
    };
  }

  async excluirProduto(id: number): Promise<void> {
    await this.produtoRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir produto', error);
      throw new InternalServerErrorException('Erro ao excluir produto');
    });
  }
}
