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
  InserirCarteiraDto,
  InserirCategoriaDespesaDto,
  InserirDespesaDto,
  PesquisarDespesasDto,
  TotalizadoresDespesasDto,
} from '@financeiro/dto';
import { Carteira, CategoriaDespesa, Despesa } from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  ExcluirDespesaUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
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
  ApiListarCarteirasDocs,
  ApiListarCategoriasDespesaDocs,
  ApiListarDespesasDocs,
  ApiObterCarteiraPorIdDocs,
} from '@financeiro/docs/financeiro-docs.decorator';

@ApiProtectedController('Financeiro')
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly despesaService: DespesaService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
    private readonly alterarCarteiraUseCase: AlterarCarteiraUseCase,
    private readonly inserirCarteiraUseCase: InserirCarteiraUseCase,
    private readonly inserirDespesaUseCase: InserirDespesaUseCase,
    private readonly alterarDespesaUseCase: AlterarDespesaUseCase,
    private readonly excluirDespesaUseCase: ExcluirDespesaUseCase,
    private readonly inserirCategoriaDespesaUseCase: InserirCategoriaDespesaUseCase,
    private readonly alterarCategoriaDespesaUseCase: AlterarCategoriaDespesaUseCase,
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
