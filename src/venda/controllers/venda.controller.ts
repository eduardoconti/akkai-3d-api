import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  AlterarFeiraDto,
  AlterarVendaDto,
  InserirFeiraDto,
  InserirTrocaDevolucaoDto,
  InserirVendaDto,
  PesquisarFeirasDto,
  PesquisarPrecosProdutosFeiraDto,
  PesquisarVendasDto,
  SalvarPrecoProdutoFeiraDto,
  TotalizadoresVendasDto,
} from '@venda/dto';
import {
  Feira,
  PrecoProdutoFeira,
  TrocaDevolucao,
  Venda,
} from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import {
  AlterarFeiraUseCase,
  AlterarVendaUseCase,
  ExcluirFeiraUseCase,
  ExcluirVendaUseCase,
  InserirFeiraUseCase,
  InserirTrocaDevolucaoUseCase,
  InserirVendaUseCase,
} from '@venda/use-cases';
import {
  ResultadoPaginado,
  ResultadoPaginadoComTotalizadores,
} from '@common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarFeiraDocs,
  ApiAlterarVendaDocs,
  ApiExcluirFeiraDocs,
  ApiExcluirVendaDocs,
  ApiInserirFeiraDocs,
  ApiInserirVendaDocs,
  ApiListarFeirasDocs,
  ApiListarFeirasPaginadasDocs,
  ApiListarVendasDocs,
  ApiObterFeiraPorIdDocs,
} from '@venda/docs/venda-docs.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiProtectedController('Vendas')
@Controller('venda')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly inserirFeiraUseCase: InserirFeiraUseCase,
    private readonly alterarFeiraUseCase: AlterarFeiraUseCase,
    private readonly excluirFeiraUseCase: ExcluirFeiraUseCase,
    private readonly inserirVendaUseCase: InserirVendaUseCase,
    private readonly inserirTrocaDevolucaoUseCase: InserirTrocaDevolucaoUseCase,
    private readonly alterarVendaUseCase: AlterarVendaUseCase,
    private readonly excluirVendaUseCase: ExcluirVendaUseCase,
    private readonly precoProdutoFeiraService: PrecoProdutoFeiraService,
  ) {}

  @ApiInserirFeiraDocs()
  @Post('feiras')
  @Permissions(PERMISSOES.FEIRA.INSERIR)
  inserirFeira(@Body() input: InserirFeiraDto): Promise<Feira> {
    return this.inserirFeiraUseCase.execute(input);
  }

  @ApiListarFeirasPaginadasDocs()
  @Get('feiras/paginado')
  @Permissions(PERMISSOES.FEIRA.LER)
  pesquisarFeiras(
    @Query() pesquisa: PesquisarFeirasDto,
  ): Promise<ResultadoPaginado<Feira>> {
    return this.feiraService.pesquisarFeiras(pesquisa);
  }

  @Get('precos-produtos-feira/paginado')
  @Permissions(PERMISSOES.PRECO_PRODUTO_FEIRA.LER)
  pesquisarPrecosProdutosFeira(
    @Query() pesquisa: PesquisarPrecosProdutosFeiraDto,
  ): Promise<ResultadoPaginado<PrecoProdutoFeira>> {
    return this.precoProdutoFeiraService.pesquisarPrecos(pesquisa);
  }

  @Get('feiras/:id/precos-produtos')
  @Permissions(PERMISSOES.PRECO_PRODUTO_FEIRA.LER)
  listarPrecosProdutosFeira(
    @Param('id', ParseIntPipe) idFeira: number,
  ): Promise<PrecoProdutoFeira[]> {
    return this.precoProdutoFeiraService.listarPorFeira(idFeira);
  }

  @Put('feiras/:id/precos-produtos')
  @Permissions(PERMISSOES.PRECO_PRODUTO_FEIRA.ALTERAR)
  salvarPrecoProdutoFeira(
    @Param('id', ParseIntPipe) idFeira: number,
    @Body() input: SalvarPrecoProdutoFeiraDto,
  ): Promise<PrecoProdutoFeira> {
    return this.precoProdutoFeiraService.salvarPreco(idFeira, input);
  }

  @Delete('feiras/:id/precos-produtos/:idProduto')
  @Permissions(PERMISSOES.PRECO_PRODUTO_FEIRA.EXCLUIR)
  excluirPrecoProdutoFeira(
    @Param('id', ParseIntPipe) idFeira: number,
    @Param('idProduto', ParseIntPipe) idProduto: number,
  ): Promise<void> {
    return this.precoProdutoFeiraService.excluirPreco(idFeira, idProduto);
  }

  @ApiObterFeiraPorIdDocs()
  @Get('feiras/:id')
  @Permissions(PERMISSOES.FEIRA.LER)
  obterFeiraPorId(@Param('id', ParseIntPipe) id: number): Promise<Feira> {
    return this.feiraService.garantirFeiraPorId(id);
  }

  @ApiAlterarFeiraDocs()
  @Put('feiras/:id')
  @Permissions(PERMISSOES.FEIRA.ALTERAR)
  alterarFeira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarFeiraDto,
  ): Promise<Feira> {
    return this.alterarFeiraUseCase.execute({ id, ...input });
  }

  @ApiExcluirFeiraDocs()
  @Delete('feiras/:id')
  @Permissions(PERMISSOES.FEIRA.EXCLUIR)
  excluirFeira(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirFeiraUseCase.execute({ id });
  }

  @ApiInserirVendaDocs()
  @Post()
  @Permissions(PERMISSOES.VENDA.INSERIR)
  inserirVenda(@Body() inserirVendaInput: InserirVendaDto) {
    return this.inserirVendaUseCase.execute(inserirVendaInput);
  }

  @Post('trocas-devolucoes')
  @Permissions(PERMISSOES.VENDA.INSERIR)
  @ApiOperation({ summary: 'Registrar troca/devolução sem vínculo com venda' })
  @ApiResponse({
    status: 201,
    description: 'Troca/devolução registrada com sucesso.',
    type: TrocaDevolucao,
  })
  inserirTrocaDevolucao(
    @Body() input: InserirTrocaDevolucaoDto,
  ): Promise<TrocaDevolucao> {
    return this.inserirTrocaDevolucaoUseCase.execute(input);
  }

  @ApiAlterarVendaDocs()
  @Put(':id')
  @Permissions(PERMISSOES.VENDA.ALTERAR)
  alterarVenda(
    @Param('id', ParseIntPipe) id: number,
    @Body() alterarVendaInput: AlterarVendaDto,
  ): Promise<Venda> {
    return this.alterarVendaUseCase.execute({ id, ...alterarVendaInput });
  }

  @ApiExcluirVendaDocs()
  @Delete(':id')
  @Permissions(PERMISSOES.VENDA.EXCLUIR)
  excluirVenda(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirVendaUseCase.execute({ id });
  }

  @ApiListarFeirasDocs()
  @Get('feiras')
  @Permissions(PERMISSOES.FEIRA.LER)
  listarFeiras(): Promise<Feira[]> {
    return this.feiraService.listarFeiras();
  }

  @ApiListarVendasDocs()
  @Get()
  @Permissions(PERMISSOES.VENDA.LER)
  listarVendas(
    @Query() pesquisa: PesquisarVendasDto,
  ): Promise<ResultadoPaginadoComTotalizadores<Venda, TotalizadoresVendasDto>> {
    return this.vendaService.listarVendas(pesquisa);
  }
}
