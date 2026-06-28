import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  AlterarCategoriaProdutoUseCase,
  AlterarProdutoUseCase,
  AlterarStatusProdutoUseCase,
  EntradaEstoqueUseCase,
  ExcluirCategoriaProdutoUseCase,
  ExcluirProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
  SaidaEstoqueUseCase,
} from '@produto/use-cases';
import {
  AlterarCategoriaProdutoDto,
  AlterarProdutoDto,
  AlterarStatusProdutoDto,
  DetalheProdutoDto,
  EntradaEstoqueDto,
  InserirCategoriaProdutoDto,
  InserirProdutoDto,
  ListarMovimentacaoEstoqueDto,
  ListarProdutoDto,
  PesquisarMovimentacoesEstoqueDto,
  PesquisarCategoriasDto,
  PesquisarProdutosDto,
  SaidaEstoqueDto,
} from '@produto/dto';
import { CategoriaProduto, Produto } from '@produto/entities';
import {
  CategoriaProdutoService,
  EstoqueService,
  ProdutoService,
} from '@produto/services';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarProdutoDocs,
  ApiAlterarStatusProdutoDocs,
  ApiAlterarCategoriaDocs,
  ApiEntradaEstoqueDocs,
  ApiExcluirCategoriaDocs,
  ApiExcluirProdutoDocs,
  ApiInserirCategoriaDocs,
  ApiInserirProdutoDocs,
  ApiListarMovimentacoesEstoqueDocs,
  ApiListarMovimentacoesEstoqueProdutosDocs,
  ApiObterCategoriaPorIdDocs,
  ApiListarCategoriasDocs,
  ApiListarProdutosDocs,
  ApiObterProdutoPorIdDocs,
  ApiSaidaEstoqueDocs,
} from '@produto/docs/produto-docs.decorator';

@ApiProtectedController('Produtos')
@Controller('produto')
export class ProdutoController {
  constructor(
    private readonly inserirProdutoUseCase: InserirProdutoUseCase,
    private readonly alterarProdutoUseCase: AlterarProdutoUseCase,
    private readonly alterarStatusProdutoUseCase: AlterarStatusProdutoUseCase,
    private readonly alterarCategoriaProdutoUseCase: AlterarCategoriaProdutoUseCase,
    private readonly excluirProdutoUseCase: ExcluirProdutoUseCase,
    private readonly excluirCategoriaProdutoUseCase: ExcluirCategoriaProdutoUseCase,
    private readonly inserirCategoriaProdutoUseCase: InserirCategoriaProdutoUseCase,
    private readonly entradaEstoqueUseCase: EntradaEstoqueUseCase,
    private readonly saidaEstoqueUseCase: SaidaEstoqueUseCase,
    private readonly produtoService: ProdutoService,
    private readonly categoriaProdutoService: CategoriaProdutoService,
    private readonly estoqueService: EstoqueService,
  ) {}

  @ApiInserirProdutoDocs()
  @Post()
  @Permissions(PERMISSOES.PRODUTO.INSERIR)
  inserirProduto(@Body() input: InserirProdutoDto) {
    return this.inserirProdutoUseCase.execute(input);
  }

  @ApiAlterarProdutoDocs()
  @Put(':id')
  @Permissions(PERMISSOES.PRODUTO.ALTERAR)
  alterarProduto(
    @Param('id') id: number,
    @Body() input: AlterarProdutoDto,
  ): Promise<Produto> {
    return this.alterarProdutoUseCase.execute({ id, ...input });
  }

  @ApiAlterarStatusProdutoDocs()
  @Patch(':id/status')
  @Permissions(PERMISSOES.PRODUTO.ALTERAR_STATUS)
  alterarStatusProduto(
    @Param('id') id: number,
    @Body() input: AlterarStatusProdutoDto,
  ): Promise<Produto> {
    return this.alterarStatusProdutoUseCase.execute({ id, ...input });
  }

  @ApiExcluirProdutoDocs()
  @Delete(':id')
  @Permissions(PERMISSOES.PRODUTO.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirProduto(@Param('id') id: number): Promise<void> {
    return this.excluirProdutoUseCase.execute({ id });
  }

  @ApiListarProdutosDocs()
  @Get()
  @Permissions(PERMISSOES.PRODUTO.LER)
  listarProdutos(
    @Query() pesquisa: PesquisarProdutosDto,
  ): Promise<ResultadoPaginado<ListarProdutoDto>> {
    return this.produtoService.listarProdutos(pesquisa);
  }

  @ApiListarCategoriasDocs()
  @Get('categorias')
  @Permissions(PERMISSOES.CATEGORIA_PRODUTO.LER)
  listarCategorias(
    @Query() pesquisa: PesquisarCategoriasDto,
  ): Promise<ResultadoPaginado<CategoriaProduto>> {
    return this.categoriaProdutoService.listarCategorias(pesquisa);
  }

  @ApiListarMovimentacoesEstoqueProdutosDocs()
  @Get('estoque/movimentacoes')
  @Permissions(PERMISSOES.ESTOQUE.LER)
  listarMovimentacoesEstoqueProdutos(
    @Query() pesquisa: PesquisarMovimentacoesEstoqueDto,
  ): Promise<ResultadoPaginado<ListarMovimentacaoEstoqueDto>> {
    return this.estoqueService.listarMovimentacoes(pesquisa);
  }

  @ApiInserirCategoriaDocs()
  @Post('categorias')
  @Permissions(PERMISSOES.CATEGORIA_PRODUTO.INSERIR)
  inserirCategoria(
    @Body() input: InserirCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return this.inserirCategoriaProdutoUseCase.execute(input);
  }

  @ApiObterCategoriaPorIdDocs()
  @Get('categorias/:id')
  @Permissions(PERMISSOES.CATEGORIA_PRODUTO.LER)
  obterCategoriaPorId(@Param('id') id: number): Promise<CategoriaProduto> {
    return this.categoriaProdutoService.garantirCategoriaPorId(id);
  }

  @ApiAlterarCategoriaDocs()
  @Put('categorias/:id')
  @Permissions(PERMISSOES.CATEGORIA_PRODUTO.ALTERAR)
  alterarCategoria(
    @Param('id') id: number,
    @Body() input: AlterarCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return this.alterarCategoriaProdutoUseCase.execute({ id, ...input });
  }

  @ApiExcluirCategoriaDocs()
  @Delete('categorias/:id')
  @Permissions(PERMISSOES.CATEGORIA_PRODUTO.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  excluirCategoria(@Param('id') id: number): Promise<void> {
    return this.excluirCategoriaProdutoUseCase.execute({ id });
  }

  @ApiObterProdutoPorIdDocs()
  @Get(':id')
  @Permissions(PERMISSOES.PRODUTO.LER)
  getProdutoById(@Param('id') id: number): Promise<DetalheProdutoDto> {
    return this.produtoService.obterDetalheProdutoPorId(id);
  }

  @ApiEntradaEstoqueDocs()
  @Post(':id/estoque/entrada')
  @Permissions(PERMISSOES.ESTOQUE.ENTRADA)
  entradaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: EntradaEstoqueDto,
  ) {
    return this.entradaEstoqueUseCase.execute({
      idProduto: id,
      quantidade,
      origem,
    });
  }

  @ApiSaidaEstoqueDocs()
  @Post(':id/estoque/saida')
  @Permissions(PERMISSOES.ESTOQUE.SAIDA)
  saidaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: SaidaEstoqueDto,
  ) {
    return this.saidaEstoqueUseCase.execute({
      idProduto: id,
      quantidade,
      origem,
    });
  }

  @ApiListarMovimentacoesEstoqueDocs()
  @Get(':id/estoque/movimentacoes')
  @Permissions(PERMISSOES.ESTOQUE.LER)
  listarMovimentacoesEstoque(
    @Param('id') id: number,
    @Query() pesquisa: PesquisarMovimentacoesEstoqueDto,
  ): Promise<ResultadoPaginado<ListarMovimentacaoEstoqueDto>> {
    return this.estoqueService.listarMovimentacoesPorProduto(id, pesquisa);
  }
}
