import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  AlterarCarteiraDto,
  AlterarCategoriaDespesaDto,
  AlterarDespesaDto,
  AlterarTaxaMeioPagamentoCarteiraDto,
  InserirCarteiraDto,
  InserirCategoriaDespesaDto,
  InserirDespesaDto,
  InserirTaxaMeioPagamentoCarteiraDto,
  PesquisarDespesasDto,
  TotalizadoresDespesasDto,
} from '@financeiro/dto';
import {
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
} from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  AlterarTaxaMeioPagamentoCarteiraUseCase,
  ExcluirCarteiraUseCase,
  ExcluirCategoriaDespesaUseCase,
  ExcluirDespesaUseCase,
  ExcluirTaxaMeioPagamentoCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
  InserirTaxaMeioPagamentoCarteiraUseCase,
} from '@financeiro/use-cases';
import {
  ResultadoPaginado,
  ResultadoPaginadoComTotalizadores,
} from '@common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarCarteiraDocs,
  ApiAlterarDespesaDocs,
  ApiExcluirDespesaDocs,
  ApiInserirCarteiraDocs,
  ApiInserirDespesaDocs,
  ApiInserirTaxaMeioPagamentoCarteiraDocs,
  ApiListarCarteirasDocs,
  ApiListarCategoriasDespesaDocs,
  ApiListarDespesasDocs,
  ApiListarTaxasMeioPagamentoCarteiraDocs,
  ApiObterTaxaMeioPagamentoCarteiraPorIdDocs,
  ApiObterCarteiraPorIdDocs,
  ApiAlterarTaxaMeioPagamentoCarteiraDocs,
  ApiExcluirTaxaMeioPagamentoCarteiraDocs,
} from '@financeiro/docs/financeiro-docs.decorator';

@ApiProtectedController('Financeiro')
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly despesaService: DespesaService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
    private readonly alterarCarteiraUseCase: AlterarCarteiraUseCase,
    private readonly inserirCarteiraUseCase: InserirCarteiraUseCase,
    private readonly inserirDespesaUseCase: InserirDespesaUseCase,
    private readonly alterarDespesaUseCase: AlterarDespesaUseCase,
    private readonly excluirCarteiraUseCase: ExcluirCarteiraUseCase,
    private readonly excluirDespesaUseCase: ExcluirDespesaUseCase,
    private readonly inserirCategoriaDespesaUseCase: InserirCategoriaDespesaUseCase,
    private readonly alterarCategoriaDespesaUseCase: AlterarCategoriaDespesaUseCase,
    private readonly excluirCategoriaDespesaUseCase: ExcluirCategoriaDespesaUseCase,
    private readonly inserirTaxaMeioPagamentoCarteiraUseCase: InserirTaxaMeioPagamentoCarteiraUseCase,
    private readonly alterarTaxaMeioPagamentoCarteiraUseCase: AlterarTaxaMeioPagamentoCarteiraUseCase,
    private readonly excluirTaxaMeioPagamentoCarteiraUseCase: ExcluirTaxaMeioPagamentoCarteiraUseCase,
  ) {}

  @ApiInserirCarteiraDocs()
  @Post('carteiras')
  async inserirCarteira(@Body() input: InserirCarteiraDto): Promise<Carteira> {
    return this.inserirCarteiraUseCase.execute(input);
  }

  @ApiListarCarteirasDocs()
  @Get('carteiras')
  async listarCarteiras() {
    return this.carteiraService.listarCarteiras();
  }

  @ApiObterCarteiraPorIdDocs()
  @Get('carteiras/:id')
  async obterCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Carteira | null> {
    return this.carteiraService.obterCarteiraPorId(id);
  }

  @ApiAlterarCarteiraDocs()
  @Put('carteiras/:id')
  async alterarCarteira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCarteiraDto,
  ): Promise<Carteira> {
    return this.alterarCarteiraUseCase.execute({ id, ...input });
  }

  @Delete('carteiras/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCarteira(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirCarteiraUseCase.execute({ id });
  }

  @ApiInserirTaxaMeioPagamentoCarteiraDocs()
  @Post('taxas-meio-pagamento-carteira')
  async inserirTaxaMeioPagamentoCarteira(
    @Body() input: InserirTaxaMeioPagamentoCarteiraDto,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.inserirTaxaMeioPagamentoCarteiraUseCase.execute(input);
  }

  @ApiListarTaxasMeioPagamentoCarteiraDocs()
  @Get('taxas-meio-pagamento-carteira')
  async listarTaxasMeioPagamentoCarteira(): Promise<
    TaxaMeioPagamentoCarteira[]
  > {
    return this.taxaMeioPagamentoCarteiraService.listarTaxasMeioPagamentoCarteira();
  }

  @ApiObterTaxaMeioPagamentoCarteiraPorIdDocs()
  @Get('taxas-meio-pagamento-carteira/:id')
  async obterTaxaMeioPagamentoCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.taxaMeioPagamentoCarteiraService.garantirTaxaMeioPagamentoCarteiraPorId(
      id,
    );
  }

  @ApiAlterarTaxaMeioPagamentoCarteiraDocs()
  @Put('taxas-meio-pagamento-carteira/:id')
  async alterarTaxaMeioPagamentoCarteira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarTaxaMeioPagamentoCarteiraDto,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.alterarTaxaMeioPagamentoCarteiraUseCase.execute({
      id,
      ...input,
    });
  }

  @ApiExcluirTaxaMeioPagamentoCarteiraDocs()
  @Delete('taxas-meio-pagamento-carteira/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirTaxaMeioPagamentoCarteira(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.excluirTaxaMeioPagamentoCarteiraUseCase.execute({ id });
  }

  @Post('categorias-despesa')
  async inserirCategoriaDespesa(
    @Body() input: InserirCategoriaDespesaDto,
  ): Promise<CategoriaDespesa> {
    return this.inserirCategoriaDespesaUseCase.execute(input);
  }

  @ApiListarCategoriasDespesaDocs()
  @Get('categorias-despesa')
  async listarCategoriasDespesa(): Promise<CategoriaDespesa[]> {
    return this.categoriaDespesaService.listarCategoriasDespesa();
  }

  @Put('categorias-despesa/:id')
  async alterarCategoriaDespesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCategoriaDespesaDto,
  ): Promise<CategoriaDespesa> {
    return this.alterarCategoriaDespesaUseCase.execute({ id, ...input });
  }

  @Delete('categorias-despesa/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCategoriaDespesa(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.excluirCategoriaDespesaUseCase.execute({ id });
  }

  @ApiInserirDespesaDocs()
  @Post('despesas')
  async inserirDespesa(@Body() input: InserirDespesaDto): Promise<Despesa> {
    return this.inserirDespesaUseCase.execute(input);
  }

  @ApiListarDespesasDocs()
  @Get('despesas')
  async listarDespesas(
    @Query() pesquisa: PesquisarDespesasDto,
  ): Promise<
    ResultadoPaginadoComTotalizadores<Despesa, TotalizadoresDespesasDto>
  > {
    return this.despesaService.listarDespesas(pesquisa);
  }

  @ApiAlterarDespesaDocs()
  @Put('despesas/:id')
  async alterarDespesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarDespesaDto,
  ): Promise<Despesa> {
    return this.alterarDespesaUseCase.execute({ id, ...input });
  }

  @ApiExcluirDespesaDocs()
  @Delete('despesas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirDespesa(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirDespesaUseCase.execute({ id });
  }
}
