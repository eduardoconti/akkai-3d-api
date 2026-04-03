import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  InserirFeiraDto,
  InserirVendaDto,
  PesquisarVendasDto,
} from '@venda/dto';
import { Feira, Venda } from '@venda/entities';
import { FeiraService, VendaService } from '@venda/services';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import {
  ApiInserirFeiraDocs,
  ApiInserirVendaDocs,
  ApiListarFeirasDocs,
  ApiListarVendasDocs,
} from '@venda/docs/venda-docs.decorator';

@ApiProtectedController('Vendas')
@Controller('venda')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
    private readonly feiraService: FeiraService,
    private readonly inserirFeiraUseCase: InserirFeiraUseCase,
    private readonly inserirVendaUseCase: InserirVendaUseCase,
  ) {}

  @ApiInserirFeiraDocs()
  @Post('feiras')
  async inserirFeira(@Body() input: InserirFeiraDto): Promise<Feira> {
    return await this.inserirFeiraUseCase.execute(input);
  }

  @ApiInserirVendaDocs()
  @Post()
  async inserirVenda(@Body() inserirVendaInput: InserirVendaDto) {
    const venda = await this.inserirVendaUseCase.execute(inserirVendaInput);
    return venda;
  }

  @ApiListarFeirasDocs()
  @Get('feiras')
  async listarFeiras(): Promise<Feira[]> {
    return await this.feiraService.listarFeiras();
  }

  @ApiListarVendasDocs()
  @Get()
  async listarVendas(
    @Query() pesquisa: PesquisarVendasDto,
  ): Promise<ResultadoPaginado<Venda>> {
    return await this.vendaService.listarVendas(pesquisa);
  }
}
