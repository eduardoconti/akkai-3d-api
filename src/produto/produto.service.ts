import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Produto } from './model/produto.model';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CategoriaProduto } from './model/categoria-produto.model';
import { DetalheProdutoDto } from './dto/detalhe-produto.dto';
import { MovimentacaoEstoque } from './model/movimentacao-estoque.model';

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

  async listarProdutos(): Promise<Produto[]> {
    return this.produtoRepository.find({ relations: { categoria: true } });
  }

  async inserirProduto(produto: Produto): Promise<Produto> {
    return this.produtoRepository.save(produto).catch((error) => {
      console.error('Erro ao inserir produto:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.driverError?.code === '23505') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // if (error.driverError.constraint === 'uq_produto_codigo') {
        throw new ConflictException(`Código ${produto.codigo} já existe`);
        // }
      }
      throw new InternalServerErrorException(`Erro ao inserir produto`);
    });
  }

  async existeCategoria(idCategoria: number): Promise<boolean> {
    const categoria = await this.categoriaRepository.exists({
      where: { id: idCategoria },
    });
    return categoria;
  }

  async listarCategorias(): Promise<CategoriaProduto[]> {
    return this.categoriaRepository.find();
  }

  async getProdutoById(id: number): Promise<DetalheProdutoDto> {
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
    origem: 'COMPRA' | 'AJUSTE' | 'PRODUCAO',
  ): Promise<void> {
    const produto = await this.produtoRepository.findOne({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const movimentacaoStoque = new MovimentacaoEstoque();
    movimentacaoStoque.idProduto = id;
    movimentacaoStoque.quantidade = quantidade;
    movimentacaoStoque.tipo = 'E';
    movimentacaoStoque.origem = origem;

    await this.movimentacaoEstoqueRepository.save(movimentacaoStoque);
  }
}
