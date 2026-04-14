import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  AlterarCategoriaProdutoUseCase,
  AlterarProdutoUseCase,
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
  DetalheProdutoDto,
  EntradaEstoqueDto,
  InserirCategoriaProdutoDto,
  InserirProdutoDto,
  ListarMovimentacaoEstoqueDto,
  ListarProdutoEstoqueDto,
  ListarProdutoDto,
  PesquisarEstoqueDto,
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
  ApiAlterarCategoriaDocs,
  ApiEntradaEstoqueDocs,
  ApiInserirCategoriaDocs,
  ApiInserirProdutoDocs,
  ApiListarEstoqueDocs,
  ApiListarMovimentacoesEstoqueDocs,
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
  async inserirProduto(@Body() input: InserirProdutoDto) {
    return this.inserirProdutoUseCase.execute(input);
  }

  @ApiAlterarProdutoDocs()
  @Put(':id')
  async alterarProduto(
    @Param('id') id: number,
    @Body() input: AlterarProdutoDto,
  ): Promise<Produto> {
    return await this.alterarProdutoUseCase.execute({ id, ...input });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirProduto(@Param('id') id: number): Promise<void> {
    return this.excluirProdutoUseCase.execute({ id });
  }

  @ApiListarProdutosDocs()
  @Get()
  async listarProdutos(
    @Query() pesquisa: PesquisarProdutosDto,
  ): Promise<ResultadoPaginado<ListarProdutoDto>> {
    return await this.produtoService.listarProdutos(pesquisa);
  }

  @ApiListarEstoqueDocs()
  @Get('estoque')
  async listarEstoque(
    @Query() pesquisa: PesquisarEstoqueDto,
  ): Promise<ResultadoPaginado<ListarProdutoEstoqueDto>> {
    return await this.produtoService.listarEstoque(pesquisa);
  }

  @ApiListarCategoriasDocs()
  @Get('categorias')
  async listarCategorias(
    @Query() pesquisa: PesquisarCategoriasDto,
  ): Promise<ResultadoPaginado<CategoriaProduto>> {
    return await this.categoriaProdutoService.listarCategorias(pesquisa);
  }

  @ApiInserirCategoriaDocs()
  @Post('categorias')
  async inserirCategoria(
    @Body() input: InserirCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return await this.inserirCategoriaProdutoUseCase.execute(input);
  }

  @ApiObterCategoriaPorIdDocs()
  @Get('categorias/:id')
  async obterCategoriaPorId(
    @Param('id') id: number,
  ): Promise<CategoriaProduto> {
    return await this.categoriaProdutoService.garantirCategoriaPorId(id);
  }

  @ApiAlterarCategoriaDocs()
  @Put('categorias/:id')
  async alterarCategoria(
    @Param('id') id: number,
    @Body() input: AlterarCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return await this.alterarCategoriaProdutoUseCase.execute({ id, ...input });
  }

  @Delete('categorias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCategoria(@Param('id') id: number): Promise<void> {
    return this.excluirCategoriaProdutoUseCase.execute({ id });
  }

  @ApiObterProdutoPorIdDocs()
  @Get(':id')
  async getProdutoById(@Param('id') id: number): Promise<DetalheProdutoDto> {
    return await this.produtoService.obterDetalheProdutoPorId(id);
  }

  @ApiEntradaEstoqueDocs()
  @Post(':id/estoque/entrada')
  async entradaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: EntradaEstoqueDto,
  ) {
    return await this.entradaEstoqueUseCase.execute({
      idProduto: id,
      quantidade,
      origem,
    });
  }

  @ApiSaidaEstoqueDocs()
  @Post(':id/estoque/saida')
  async saidaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: SaidaEstoqueDto,
  ) {
    return await this.saidaEstoqueUseCase.execute({
      idProduto: id,
      quantidade,
      origem,
    });
  }

  @ApiListarMovimentacoesEstoqueDocs()
  @Get(':id/estoque/movimentacoes')
  async listarMovimentacoesEstoque(
    @Param('id') id: number,
    @Query() pesquisa: PesquisarMovimentacoesEstoqueDto,
  ): Promise<ResultadoPaginado<ListarMovimentacaoEstoqueDto>> {
    return await this.estoqueService.listarMovimentacoesPorProduto(
      id,
      pesquisa,
    );
  }
}
