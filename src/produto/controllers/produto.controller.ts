import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
  SaidaEstoqueDto,
} from '@produto/dto';
import { CategoriaProduto, Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

@Controller('produto')
export class ProdutoController {
  constructor(
    private readonly inserirProdutoUseCase: InserirProdutoUseCase,
    private readonly alterarProdutoUseCase: AlterarProdutoUseCase,
    private readonly inserirCategoriaProdutoUseCase: InserirCategoriaProdutoUseCase,
    private readonly produtoService: ProdutoService,
  ) {}

  @Post()
  async inserirProduto(@Body() input: InserirProdutoDto) {
    return this.inserirProdutoUseCase.execute(input);
  }

  @Put(':id')
  async alterarProduto(
    @Param('id') id: number,
    @Body() input: AlterarProdutoDto,
  ): Promise<Produto> {
    return await this.alterarProdutoUseCase.execute(id, input);
  }

  @Get()
  async listarProdutos(): Promise<ListarProdutoDto[]> {
    return await this.produtoService.listarProdutos();
  }

  @Get('categorias')
  async listarCategorias() {
    return await this.produtoService.listarCategorias();
  }

  @Post('categorias')
  async inserirCategoria(
    @Body() input: InserirCategoriaProdutoDto,
  ): Promise<CategoriaProduto> {
    return await this.inserirCategoriaProdutoUseCase.execute(input);
  }

  @Get(':id')
  async getProdutoById(@Param('id') id: number): Promise<DetalheProdutoDto> {
    return await this.produtoService.obterDetalheProdutoPorId(id);
  }

  @Post(':id/estoque/entrada')
  async entradaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: EntradaEstoqueDto,
  ) {
    return await this.produtoService.entradaEstoque(id, quantidade, origem);
  }

  @Post(':id/estoque/saida')
  async saidaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: SaidaEstoqueDto,
  ) {
    return await this.produtoService.saidaEstoque(id, quantidade, origem);
  }
}
