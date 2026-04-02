import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  AlterarProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
} from '@produto/use-cases';
import {
  AlterarProdutoDto,
  DetalheProdutoDto,
  EntradaEstoqueDto,
  InserirCategoriaProdutoDto,
  InserirProdutoDto,
  ListarProdutoDto,
  PesquisarProdutosDto,
  SaidaEstoqueDto,
} from '@produto/dto';
import { CategoriaProduto, Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarProdutoDocs,
  ApiEntradaEstoqueDocs,
  ApiInserirCategoriaDocs,
  ApiInserirProdutoDocs,
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
    private readonly inserirCategoriaProdutoUseCase: InserirCategoriaProdutoUseCase,
    private readonly produtoService: ProdutoService,
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
    return await this.alterarProdutoUseCase.execute(id, input);
  }

  @ApiListarProdutosDocs()
  @Get()
  async listarProdutos(
    @Query() pesquisa: PesquisarProdutosDto,
  ): Promise<ResultadoPaginado<ListarProdutoDto>> {
    return await this.produtoService.listarProdutos(pesquisa);
  }

  @ApiListarCategoriasDocs()
  @Get('categorias')
  async listarCategorias() {
    return await this.produtoService.listarCategorias();
  }

  @ApiInserirCategoriaDocs()
  @Post('categorias')
  async inserirCategoria(
    @Body() input: InserirCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return await this.inserirCategoriaProdutoUseCase.execute(input);
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
    return await this.produtoService.entradaEstoque(id, quantidade, origem);
  }

  @ApiSaidaEstoqueDocs()
  @Post(':id/estoque/saida')
  async saidaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: SaidaEstoqueDto,
  ) {
    return await this.produtoService.saidaEstoque(id, quantidade, origem);
  }
}
