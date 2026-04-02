import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  AlterarCarteiraDto,
  InserirCarteiraDto,
  InserirDespesaDto,
  PesquisarDespesasDto,
} from '@financeiro/dto';
import { Carteira, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarCarteiraDocs,
  ApiInserirCarteiraDocs,
  ApiInserirDespesaDocs,
  ApiListarCarteirasDocs,
  ApiListarDespesasDocs,
  ApiObterCarteiraPorIdDocs,
} from '@financeiro/docs/financeiro-docs.decorator';

@ApiProtectedController('Financeiro')
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly alterarCarteiraUseCase: AlterarCarteiraUseCase,
    private readonly inserirCarteiraUseCase: InserirCarteiraUseCase,
    private readonly inserirDespesaUseCase: InserirDespesaUseCase,
  ) {}

  @ApiInserirCarteiraDocs()
  @Post('carteiras')
  async inserirCarteira(@Body() input: InserirCarteiraDto): Promise<Carteira> {
    return this.inserirCarteiraUseCase.execute(input);
  }

  @ApiListarCarteirasDocs()
  @Get('carteiras')
  async listarCarteiras() {
    return this.financeiroService.listarCarteiras();
  }

  @ApiObterCarteiraPorIdDocs()
  @Get('carteiras/:id')
  async obterCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Carteira | null> {
    return this.financeiroService.obterCarteiraPorId(id);
  }

  @ApiAlterarCarteiraDocs()
  @Put('carteiras/:id')
  async alterarCarteira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCarteiraDto,
  ): Promise<Carteira> {
    return this.alterarCarteiraUseCase.execute(id, input);
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
  ): Promise<ResultadoPaginado<Despesa>> {
    return this.financeiroService.listarDespesas(pesquisa);
  }
}
