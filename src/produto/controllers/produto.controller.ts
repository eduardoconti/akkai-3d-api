import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
} from '@produto/use-cases';
import {
  DetalheProdutoDto,
  EntradaEstoqueDto,
  InserirCategoriaProdutoDto,
  InserirProdutoDto,
} from '@produto/dto';
import { CategoriaProduto, Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';

@Controller('produto')
export class ProdutoController {
  constructor(
    private readonly inserirProdutoUseCase: InserirProdutoUseCase,
    private readonly inserirCategoriaProdutoUseCase: InserirCategoriaProdutoUseCase,
    private readonly produtoService: ProdutoService,
  ) {}

  @Post()
  async inserirProduto(@Body() input: InserirProdutoDto) {
    return this.inserirProdutoUseCase.execute(input);
  }

  @Get()
  async listarProdutos(): Promise<Produto[]> {
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
    return await this.produtoService.getProdutoById(id);
  }

  @Post(':id/estoque/entrada')
  async entradaEstoque(
    @Param('id') id: number,
    @Body() { quantidade, origem }: EntradaEstoqueDto,
  ) {
    return await this.produtoService.entradaEstoque(id, quantidade, origem);
  }
}
