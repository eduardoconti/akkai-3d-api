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
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  AtualizarOrcamentoDto,
  InserirOrcamentoDto,
  PesquisarOrcamentosDto,
} from '@orcamento/dto';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import {
  AtualizarOrcamentoUseCase,
  InserirOrcamentoUseCase,
} from '@orcamento/use-cases';
import {
  ApiAtualizarOrcamentoDocs,
  ApiInserirOrcamentoDocs,
  ApiListarOrcamentosDocs,
} from '@orcamento/docs/orcamento-docs.decorator';

@ApiProtectedController('Orçamentos')
@Controller('orcamento')
export class OrcamentoController {
  constructor(
    private readonly orcamentoService: OrcamentoService,
    private readonly inserirOrcamentoUseCase: InserirOrcamentoUseCase,
    private readonly atualizarOrcamentoUseCase: AtualizarOrcamentoUseCase,
  ) {}

  @ApiInserirOrcamentoDocs()
  @Post()
  async inserirOrcamento(
    @Body() input: InserirOrcamentoDto,
  ): Promise<Orcamento> {
    return this.inserirOrcamentoUseCase.execute(input);
  }

  @ApiAtualizarOrcamentoDocs()
  @Put(':id')
  async atualizarOrcamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AtualizarOrcamentoDto,
  ): Promise<Orcamento> {
    return this.atualizarOrcamentoUseCase.execute(id, input);
  }

  @ApiListarOrcamentosDocs()
  @Get()
  async listarOrcamentos(
    @Query() pesquisa: PesquisarOrcamentosDto,
  ): Promise<ResultadoPaginado<Orcamento>> {
    return this.orcamentoService.listarOrcamentos(pesquisa);
  }
}
