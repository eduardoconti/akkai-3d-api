import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
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
  ApiExcluirOrcamentoDocs,
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
  @Permissions(PERMISSOES.ORCAMENTO.INSERIR)
  async inserirOrcamento(
    @Body() input: InserirOrcamentoDto,
  ): Promise<Orcamento> {
    return this.inserirOrcamentoUseCase.execute(input);
  }

  @ApiAtualizarOrcamentoDocs()
  @Put(':id')
  @Permissions(PERMISSOES.ORCAMENTO.ALTERAR)
  async atualizarOrcamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AtualizarOrcamentoDto,
  ): Promise<Orcamento> {
    return this.atualizarOrcamentoUseCase.execute(id, input);
  }

  @ApiListarOrcamentosDocs()
  @Get()
  @Permissions(PERMISSOES.ORCAMENTO.LER)
  async listarOrcamentos(
    @Query() pesquisa: PesquisarOrcamentosDto,
  ): Promise<ResultadoPaginado<Orcamento>> {
    return this.orcamentoService.listarOrcamentos(pesquisa);
  }

  @ApiExcluirOrcamentoDocs()
  @Delete(':id')
  @Permissions(PERMISSOES.ORCAMENTO.EXCLUIR)
  async excluirOrcamento(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.orcamentoService.excluirOrcamento(id);
  }
}
