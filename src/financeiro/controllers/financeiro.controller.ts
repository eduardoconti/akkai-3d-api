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
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  AlterarCarteiraDto,
  AlterarCategoriaDespesaDto,
  AlterarDespesaDto,
  AlterarTaxaMeioPagamentoCarteiraDto,
  InserirAjusteCarteiraDto,
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
  AjusteCarteira,
  TaxaMeioPagamentoCarteira,
} from '@financeiro/entities';
import {
  AjusteCarteiraService,
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
  InserirAjusteCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
  InserirTaxaMeioPagamentoCarteiraUseCase,
} from '@financeiro/use-cases';
import { ResultadoPaginadoComTotalizadores } from '@common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarCarteiraDocs,
  ApiAlterarCategoriaDespesaDocs,
  ApiAlterarDespesaDocs,
  ApiExcluirCarteiraDocs,
  ApiExcluirCategoriaDespesaDocs,
  ApiExcluirDespesaDocs,
  ApiInserirAjusteCarteiraDocs,
  ApiInserirCarteiraDocs,
  ApiInserirCategoriaDespesaDocs,
  ApiInserirDespesaDocs,
  ApiInserirTaxaMeioPagamentoCarteiraDocs,
  ApiListarCarteirasDocs,
  ApiListarCategoriasDespesaDocs,
  ApiListarDespesasDocs,
  ApiListarAjustesCarteiraDocs,
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
    private readonly ajusteCarteiraService: AjusteCarteiraService,
    private readonly despesaService: DespesaService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
    private readonly taxaMeioPagamentoCarteiraService: TaxaMeioPagamentoCarteiraService,
    private readonly alterarCarteiraUseCase: AlterarCarteiraUseCase,
    private readonly inserirAjusteCarteiraUseCase: InserirAjusteCarteiraUseCase,
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
  @Permissions(PERMISSOES.FINANCEIRO.CARTEIRA.INSERIR)
  async inserirCarteira(@Body() input: InserirCarteiraDto): Promise<Carteira> {
    return this.inserirCarteiraUseCase.execute(input);
  }

  @ApiListarCarteirasDocs()
  @Get('carteiras')
  @Permissions(PERMISSOES.FINANCEIRO.CARTEIRA.LER)
  async listarCarteiras() {
    return this.carteiraService.listarCarteiras();
  }

  @ApiObterCarteiraPorIdDocs()
  @Get('carteiras/:id')
  @Permissions(PERMISSOES.FINANCEIRO.CARTEIRA.LER)
  async obterCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Carteira | null> {
    return this.carteiraService.obterCarteiraPorId(id);
  }

  @ApiAlterarCarteiraDocs()
  @Put('carteiras/:id')
  @Permissions(PERMISSOES.FINANCEIRO.CARTEIRA.ALTERAR)
  async alterarCarteira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCarteiraDto,
  ): Promise<Carteira> {
    return this.alterarCarteiraUseCase.execute({ id, ...input });
  }

  @ApiExcluirCarteiraDocs()
  @Delete('carteiras/:id')
  @Permissions(PERMISSOES.FINANCEIRO.CARTEIRA.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCarteira(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirCarteiraUseCase.execute({ id });
  }

  @ApiInserirAjusteCarteiraDocs()
  @Post('carteiras/:id/ajustes')
  @Permissions(PERMISSOES.FINANCEIRO.AJUSTE_CARTEIRA.INSERIR)
  async inserirAjusteCarteira(
    @Param('id', ParseIntPipe) idCarteira: number,
    @Body() input: InserirAjusteCarteiraDto,
  ): Promise<AjusteCarteira> {
    return this.inserirAjusteCarteiraUseCase.execute({ idCarteira, ...input });
  }

  @ApiListarAjustesCarteiraDocs()
  @Get('carteiras/:id/ajustes')
  @Permissions(PERMISSOES.FINANCEIRO.AJUSTE_CARTEIRA.LER)
  async listarAjustesCarteira(
    @Param('id', ParseIntPipe) idCarteira: number,
  ): Promise<AjusteCarteira[]> {
    await this.carteiraService.garantirExisteCarteira(idCarteira);
    return this.ajusteCarteiraService.listarAjustesPorCarteira(idCarteira);
  }

  @ApiInserirTaxaMeioPagamentoCarteiraDocs()
  @Post('taxas-meio-pagamento-carteira')
  @Permissions(PERMISSOES.FINANCEIRO.TAXA_MEIO_PAGAMENTO_CARTEIRA.INSERIR)
  async inserirTaxaMeioPagamentoCarteira(
    @Body() input: InserirTaxaMeioPagamentoCarteiraDto,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.inserirTaxaMeioPagamentoCarteiraUseCase.execute(input);
  }

  @ApiListarTaxasMeioPagamentoCarteiraDocs()
  @Get('taxas-meio-pagamento-carteira')
  @Permissions(PERMISSOES.FINANCEIRO.TAXA_MEIO_PAGAMENTO_CARTEIRA.LER)
  async listarTaxasMeioPagamentoCarteira(): Promise<
    TaxaMeioPagamentoCarteira[]
  > {
    return this.taxaMeioPagamentoCarteiraService.listarTaxasMeioPagamentoCarteira();
  }

  @ApiObterTaxaMeioPagamentoCarteiraPorIdDocs()
  @Get('taxas-meio-pagamento-carteira/:id')
  @Permissions(PERMISSOES.FINANCEIRO.TAXA_MEIO_PAGAMENTO_CARTEIRA.LER)
  async obterTaxaMeioPagamentoCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.taxaMeioPagamentoCarteiraService.garantirTaxaMeioPagamentoCarteiraPorId(
      id,
    );
  }

  @ApiAlterarTaxaMeioPagamentoCarteiraDocs()
  @Put('taxas-meio-pagamento-carteira/:id')
  @Permissions(PERMISSOES.FINANCEIRO.TAXA_MEIO_PAGAMENTO_CARTEIRA.ALTERAR)
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
  @Permissions(PERMISSOES.FINANCEIRO.TAXA_MEIO_PAGAMENTO_CARTEIRA.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirTaxaMeioPagamentoCarteira(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.excluirTaxaMeioPagamentoCarteiraUseCase.execute({ id });
  }

  @ApiInserirCategoriaDespesaDocs()
  @Post('categorias-despesa')
  @Permissions(PERMISSOES.FINANCEIRO.CATEGORIA_DESPESA.INSERIR)
  async inserirCategoriaDespesa(
    @Body() input: InserirCategoriaDespesaDto,
  ): Promise<CategoriaDespesa> {
    return this.inserirCategoriaDespesaUseCase.execute(input);
  }

  @ApiListarCategoriasDespesaDocs()
  @Get('categorias-despesa')
  @Permissions(PERMISSOES.FINANCEIRO.CATEGORIA_DESPESA.LER)
  async listarCategoriasDespesa(): Promise<CategoriaDespesa[]> {
    return this.categoriaDespesaService.listarCategoriasDespesa();
  }

  @ApiAlterarCategoriaDespesaDocs()
  @Put('categorias-despesa/:id')
  @Permissions(PERMISSOES.FINANCEIRO.CATEGORIA_DESPESA.ALTERAR)
  async alterarCategoriaDespesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCategoriaDespesaDto,
  ): Promise<CategoriaDespesa> {
    return this.alterarCategoriaDespesaUseCase.execute({ id, ...input });
  }

  @ApiExcluirCategoriaDespesaDocs()
  @Delete('categorias-despesa/:id')
  @Permissions(PERMISSOES.FINANCEIRO.CATEGORIA_DESPESA.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirCategoriaDespesa(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.excluirCategoriaDespesaUseCase.execute({ id });
  }

  @ApiInserirDespesaDocs()
  @Post('despesas')
  @Permissions(PERMISSOES.FINANCEIRO.DESPESA.INSERIR)
  async inserirDespesa(@Body() input: InserirDespesaDto): Promise<Despesa> {
    return this.inserirDespesaUseCase.execute(input);
  }

  @ApiListarDespesasDocs()
  @Get('despesas')
  @Permissions(PERMISSOES.FINANCEIRO.DESPESA.LER)
  async listarDespesas(
    @Query() pesquisa: PesquisarDespesasDto,
  ): Promise<
    ResultadoPaginadoComTotalizadores<Despesa, TotalizadoresDespesasDto>
  > {
    return this.despesaService.listarDespesas(pesquisa);
  }

  @ApiAlterarDespesaDocs()
  @Put('despesas/:id')
  @Permissions(PERMISSOES.FINANCEIRO.DESPESA.ALTERAR)
  async alterarDespesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarDespesaDto,
  ): Promise<Despesa> {
    return this.alterarDespesaUseCase.execute({ id, ...input });
  }

  @ApiExcluirDespesaDocs()
  @Delete('despesas/:id')
  @Permissions(PERMISSOES.FINANCEIRO.DESPESA.EXCLUIR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirDespesa(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.excluirDespesaUseCase.execute({ id });
  }
}
