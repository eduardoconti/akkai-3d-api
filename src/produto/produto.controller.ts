import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InserirProdutoUseCase } from './use-case/inserir-produto.use-case';
import { InserirProdutoDto } from './dto/inserir-produto.dto';
import { Produto } from './model/produto.model';
import { ProdutoService } from './produto.service';
import { DetalheProdutoDto } from './dto/detalhe-produto.dto';

@Controller('produto')
export class ProdutoController {
  constructor(
    private readonly inserirProdutoUseCase: InserirProdutoUseCase,
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

  @Get(':id')
  async getProdutoById(@Param('id') id: number): Promise<DetalheProdutoDto> {
    return await this.produtoService.getProdutoById(id);
  }

  @Post(':id/estoque/entrada')
  async entradaEstoque(
    @Param('id') id: number,
    @Body()
    {
      quantidade,
      origem,
    }: { quantidade: number; origem: 'COMPRA' | 'AJUSTE' | 'PRODUCAO' },
  ) {
    return await this.produtoService.entradaEstoque(id, quantidade, origem);
  }
}
