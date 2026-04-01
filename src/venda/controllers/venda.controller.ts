import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  InserirFeiraDto,
  InserirVendaDto,
  PesquisarVendasDto,
} from '@venda/dto';
import { Feira, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';

@Controller('venda')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
    private readonly inserirFeiraUseCase: InserirFeiraUseCase,
    private readonly inserirVendaUseCase: InserirVendaUseCase,
  ) {}

  @Post('feiras')
  async inserirFeira(@Body() input: InserirFeiraDto): Promise<Feira> {
    return await this.inserirFeiraUseCase.execute(input);
  }

  @Post()
  async inserirVenda(@Body() inserirVendaInput: InserirVendaDto) {
    const venda = await this.inserirVendaUseCase.execute(inserirVendaInput);
    return venda;
  }

  @Get('feiras')
  async listarFeiras(): Promise<Feira[]> {
    return await this.vendaService.listarFeiras();
  }

  @Get()
  async listarVendas(
    @Query() pesquisa: PesquisarVendasDto,
  ): Promise<ResultadoPaginado<Venda>> {
    return await this.vendaService.listarVendas(pesquisa);
  }
}
