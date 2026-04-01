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

@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly alterarCarteiraUseCase: AlterarCarteiraUseCase,
    private readonly inserirCarteiraUseCase: InserirCarteiraUseCase,
    private readonly inserirDespesaUseCase: InserirDespesaUseCase,
  ) {}

  @Post('carteiras')
  async inserirCarteira(@Body() input: InserirCarteiraDto): Promise<Carteira> {
    return this.inserirCarteiraUseCase.execute(input);
  }

  @Get('carteiras')
  async listarCarteiras() {
    return this.financeiroService.listarCarteiras();
  }

  @Get('carteiras/:id')
  async obterCarteiraPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Carteira | null> {
    return this.financeiroService.obterCarteiraPorId(id);
  }

  @Put('carteiras/:id')
  async alterarCarteira(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCarteiraDto,
  ): Promise<Carteira> {
    return this.alterarCarteiraUseCase.execute(id, input);
  }

  @Post('despesas')
  async inserirDespesa(@Body() input: InserirDespesaDto): Promise<Despesa> {
    return this.inserirDespesaUseCase.execute(input);
  }

  @Get('despesas')
  async listarDespesas(
    @Query() pesquisa: PesquisarDespesasDto,
  ): Promise<ResultadoPaginado<Despesa>> {
    return this.financeiroService.listarDespesas(pesquisa);
  }
}
