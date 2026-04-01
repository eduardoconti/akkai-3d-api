import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  InserirCarteiraDto,
  InserirDespesaDto,
  PesquisarDespesasDto,
} from '@financeiro/dto';
import { Carteira, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
import {
  InserirCarteiraUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';

@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
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
