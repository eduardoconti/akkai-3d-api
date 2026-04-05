import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiProtectedController } from '../../common/docs/decorators/api-controller-docs.decorator';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { InserirOrcamentoDto, PesquisarOrcamentosDto } from '@orcamento/dto';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { InserirOrcamentoUseCase } from '@orcamento/use-cases';

@ApiProtectedController('Orçamentos')
@Controller('orcamento')
export class OrcamentoController {
  constructor(
    private readonly orcamentoService: OrcamentoService,
    private readonly inserirOrcamentoUseCase: InserirOrcamentoUseCase,
  ) {}

  @Post()
  async inserirOrcamento(
    @Body() input: InserirOrcamentoDto,
  ): Promise<Orcamento> {
    return this.inserirOrcamentoUseCase.execute(input);
  }

  @Get()
  async listarOrcamentos(
    @Query() pesquisa: PesquisarOrcamentosDto,
  ): Promise<ResultadoPaginado<Orcamento>> {
    return this.orcamentoService.listarOrcamentos(pesquisa);
  }
}
