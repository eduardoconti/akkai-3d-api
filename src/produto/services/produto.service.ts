import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DetalheProdutoDto,
  ListarProdutoDto,
  PesquisarCategoriasDto,
  PesquisarProdutosDto,
} from '@produto/dto';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(CategoriaProduto)
    private readonly categoriaRepository: Repository<CategoriaProduto>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(MovimentacaoEstoque)
    private readonly movimentacaoEstoqueRepository: Repository<MovimentacaoEstoque>,
  ) {}

  async listarProdutos(
    pesquisa: PesquisarProdutosDto,
  ): Promise<ResultadoPaginado<ListarProdutoDto>> {
    const termo = pesquisa.termo?.toLowerCase();
    const offset = (pesquisa.pagina - 1) * pesquisa.tamanhoPagina;
    const orderBy = pesquisa.ordenarPor === 'codigo' ? 'p.codigo' : 'p.nome';
    const orderDirection = pesquisa.direcao === 'desc' ? 'DESC' : 'ASC';
    const filtros: string[] = [];
    const parametros: unknown[] = [];

    if (termo) {
      parametros.push(`%${termo}%`);
      filtros.push(`
        (
          LOWER(p.nome) LIKE $${parametros.length}
          OR LOWER(p.codigo) LIKE $${parametros.length}
          OR LOWER(COALESCE(p.descricao, '')) LIKE $${parametros.length}
          OR LOWER(c.nome) LIKE $${parametros.length}
        )
      `);
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
        codigo: string;
        descricao: string | null;
        id_categoria: string;
        estoque_minimo: string | null;
        valor: string;
        categoria_id: string;
        categoria_nome: string;
        quantidade_estoque: string | null;
      }>
    >(
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
         p.id,
         p.nome,
         p.codigo,
         p.descricao,
         p.id_categoria,
         p.estoque_minimo,
         p.valor,
         c.id AS categoria_id,
         c.nome AS categoria_nome,
         COALESCE(e.quantidade_estoque, 0) AS quantidade_estoque
       FROM produto p
       INNER JOIN categoria_produto c ON c.id = p.id_categoria
       LEFT JOIN estoque e ON e.id_produto = p.id
       ${whereClause}
       ORDER BY ${orderBy} ${orderDirection}
       LIMIT $${parametros.length - 1}
       OFFSET $${parametros.length}
      `,
      parametros,
    );

    const itens = produtos.map((produto) => ({
      id: Number(produto.id),
      nome: produto.nome,
      codigo: produto.codigo,
      descricao: produto.descricao ?? undefined,
      idCategoria: Number(produto.id_categoria),
      estoqueMinimo:
        produto.estoque_minimo === null
          ? undefined
          : Number(produto.estoque_minimo),
      valor: Number(produto.valor),
      categoria: {
        id: Number(produto.categoria_id),
        nome: produto.categoria_nome,
      },
      quantidadeEstoque: Number(produto.quantidade_estoque ?? 0),
    }));

    const totalItens = Number(contagem[0]?.total ?? 0);

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  async salvar(produto: Produto): Promise<Produto> {
    return this.produtoRepository.save(produto).catch((error) => {
      console.error('Erro ao salvar produto:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.driverError?.code === '23505') {
        throw new ConflictException(`Código ${produto.codigo} já existe`);
      }
      throw new InternalServerErrorException(`Erro ao salvar produto`);
    });
  }

  async obterProdutoPorId(id: number): Promise<Produto | null> {
    return await this.produtoRepository.findOne({ where: { id } });
  }

  async existeProduto(idProduto: number): Promise<boolean> {
    return await this.produtoRepository.exists({
      where: { id: idProduto },
    });
  }

  async inserirCategoria(
    categoria: CategoriaProduto,
  ): Promise<CategoriaProduto> {
    return this.salvarCategoria(categoria);
  }

  async salvarCategoria(
    categoria: CategoriaProduto,
  ): Promise<CategoriaProduto> {
    return this.categoriaRepository.save(categoria).catch((error) => {
      console.error('Erro ao inserir categoria:', error);
      throw new InternalServerErrorException('Erro ao inserir categoria');
    });
  }

  async existeCategoria(idCategoria: number): Promise<boolean> {
    const categoria = await this.categoriaRepository.exists({
      where: { id: idCategoria },
    });
    return categoria;
  }

  async listarCategorias(
    pesquisa: PesquisarCategoriasDto,
  ): Promise<ResultadoPaginado<CategoriaProduto>> {
    const termo = pesquisa.termo?.toLowerCase();
    const offset = (pesquisa.pagina - 1) * pesquisa.tamanhoPagina;
    const queryBuilder = this.categoriaRepository
      .createQueryBuilder('categoria')
      .orderBy('categoria.nome', 'ASC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.where('LOWER(categoria.nome) LIKE :termo', {
        termo: `%${termo}%`,
      });
    }

    const [itens, totalItens] = await queryBuilder.getManyAndCount();

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  async obterCategoriaPorId(id: number): Promise<CategoriaProduto | null> {
    return await this.categoriaRepository.findOne({ where: { id } });
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

  async entradaEstoque(
    id: number,
    quantidade: number,
    origem:
      | OrigemMovimentacaoEstoque.COMPRA
      | OrigemMovimentacaoEstoque.AJUSTE
      | OrigemMovimentacaoEstoque.PRODUCAO,
  ): Promise<void> {
    const produtoExiste = await this.existeProduto(id);

    if (!produtoExiste) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const movimentacaoStoque = new MovimentacaoEstoque();
    movimentacaoStoque.idProduto = id;
    movimentacaoStoque.quantidade = quantidade;
    movimentacaoStoque.tipo = TipoMovimentacaoEstoque.ENTRADA;
    movimentacaoStoque.origem = origem;

    await this.movimentacaoEstoqueRepository.save(movimentacaoStoque);
  }

  async saidaEstoque(
    id: number,
    quantidade: number,
    origem: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA,
  ): Promise<void> {
    const produtoExiste = await this.existeProduto(id);

    if (!produtoExiste) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const movimentacaoStoque = new MovimentacaoEstoque();
    movimentacaoStoque.idProduto = id;
    movimentacaoStoque.quantidade = quantidade;
    movimentacaoStoque.tipo = TipoMovimentacaoEstoque.SAIDA;
    movimentacaoStoque.origem = origem;

    await this.movimentacaoEstoqueRepository.save(movimentacaoStoque);
  }
}
