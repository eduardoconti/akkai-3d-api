import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  AlterarRevendedorDto,
  DetalheConsignacaoDto,
  InserirConsignacaoDto,
  InserirRevendedorDto,
  ListarConsignacaoDto,
  PesquisarConsignacoesDto,
  PesquisarRevendedoresDto,
  RegistrarMovimentoConsignacaoDto,
  RegistrarVendasConsignadasDto,
} from '@consignacao/dto';
import { Revendedor } from '@consignacao/entities';
import {
  ConsignacaoPdfService,
  ConsignacaoService,
  RevendedorService,
} from '@consignacao/services';
import {
  AlterarRevendedorUseCase,
  InserirConsignacaoUseCase,
  InserirRevendedorUseCase,
  RegistrarDevolucaoConsignadaUseCase,
  RegistrarVendasRevendedorConsignadoUseCase,
} from '@consignacao/use-cases';
import {
  ApiAlterarRevendedorDocs,
  ApiInserirConsignacaoDocs,
  ApiInserirRevendedorDocs,
  ApiListarConsignacoesDocs,
  ApiListarRevendedoresDocs,
  ApiObterConsignacaoPorIdDocs,
  ApiObterRevendedorPorIdDocs,
  ApiRelatorioConsignacaoPdfDocs,
  ApiRegistrarDevolucaoConsignadaDocs,
  ApiRegistrarVendasRevendedorConsignadoDocs,
} from '@consignacao/docs/consignacao-docs.decorator';

@ApiProtectedController('Consignação')
@Controller('consignacao')
export class ConsignacaoController {
  constructor(
    private readonly revendedorService: RevendedorService,
    private readonly consignacaoService: ConsignacaoService,
    private readonly consignacaoPdfService: ConsignacaoPdfService,
    private readonly inserirRevendedorUseCase: InserirRevendedorUseCase,
    private readonly alterarRevendedorUseCase: AlterarRevendedorUseCase,
    private readonly inserirConsignacaoUseCase: InserirConsignacaoUseCase,
    private readonly registrarVendasRevendedorConsignadoUseCase: RegistrarVendasRevendedorConsignadoUseCase,
    private readonly registrarDevolucaoConsignadaUseCase: RegistrarDevolucaoConsignadaUseCase,
  ) {}

  @ApiInserirRevendedorDocs()
  @Post('revendedores')
  @Permissions(PERMISSOES.REVENDEDOR.INSERIR)
  async inserirRevendedor(
    @Body() input: InserirRevendedorDto,
  ): Promise<Revendedor> {
    return this.inserirRevendedorUseCase.execute(input);
  }

  @ApiListarRevendedoresDocs()
  @Get('revendedores')
  @Permissions(PERMISSOES.REVENDEDOR.LER)
  async listarRevendedores(
    @Query() pesquisa: PesquisarRevendedoresDto,
  ): Promise<ResultadoPaginado<Revendedor>> {
    return this.revendedorService.listarRevendedores(pesquisa);
  }

  @ApiObterRevendedorPorIdDocs()
  @Get('revendedores/:id')
  @Permissions(PERMISSOES.REVENDEDOR.LER)
  async obterRevendedorPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Revendedor> {
    return this.revendedorService.garantirRevendedorPorId(id);
  }

  @ApiAlterarRevendedorDocs()
  @Put('revendedores/:id')
  @Permissions(PERMISSOES.REVENDEDOR.ALTERAR)
  async alterarRevendedor(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarRevendedorDto,
  ): Promise<Revendedor> {
    return this.alterarRevendedorUseCase.execute({ id, ...input });
  }

  @ApiRegistrarVendasRevendedorConsignadoDocs()
  @Post('revendedores/:id/vendas')
  @Permissions(PERMISSOES.CONSIGNACAO.REGISTRAR_VENDA)
  async registrarVendasRevendedorConsignado(
    @Param('id', ParseIntPipe) idRevendedor: number,
    @Body() input: RegistrarVendasConsignadasDto,
  ): Promise<DetalheConsignacaoDto[]> {
    return this.registrarVendasRevendedorConsignadoUseCase.execute({
      idRevendedor,
      idCarteira: input.idCarteira,
      meioPagamento: input.meioPagamento,
      itens: input.itens,
    });
  }

  @ApiInserirConsignacaoDocs()
  @Post()
  @Permissions(PERMISSOES.CONSIGNACAO.INSERIR)
  async inserirConsignacao(
    @Body() input: InserirConsignacaoDto,
  ): Promise<DetalheConsignacaoDto> {
    return this.inserirConsignacaoUseCase.execute(input);
  }

  @ApiListarConsignacoesDocs()
  @Get()
  @Permissions(PERMISSOES.CONSIGNACAO.LER)
  async listarConsignacoes(
    @Query() pesquisa: PesquisarConsignacoesDto,
  ): Promise<ResultadoPaginado<ListarConsignacaoDto>> {
    return this.consignacaoService.listarConsignacoes(pesquisa);
  }

  @ApiObterConsignacaoPorIdDocs()
  @Get(':id')
  @Permissions(PERMISSOES.CONSIGNACAO.LER)
  async obterConsignacaoPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DetalheConsignacaoDto> {
    return this.consignacaoService.garantirDetalheConsignacao(id);
  }

  @ApiRelatorioConsignacaoPdfDocs()
  @Get(':id/pdf')
  @Permissions(PERMISSOES.CONSIGNACAO.LER)
  async obterRelatorioConsignacaoPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const consignacao =
      await this.consignacaoService.garantirDetalheConsignacao(id);
    const relatorio = this.consignacaoPdfService.gerarRelatorio(consignacao);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${relatorio.nomeArquivo}"`,
    );
    response.setHeader('Content-Length', relatorio.buffer.length);

    return new StreamableFile(relatorio.buffer);
  }

  @ApiRegistrarDevolucaoConsignadaDocs()
  @Post(':id/itens/:idItem/devolucoes')
  @Permissions(PERMISSOES.CONSIGNACAO.REGISTRAR_DEVOLUCAO)
  async registrarDevolucaoConsignada(
    @Param('id', ParseIntPipe) idConsignacao: number,
    @Param('idItem', ParseIntPipe) idItem: number,
    @Body() input: RegistrarMovimentoConsignacaoDto,
  ): Promise<DetalheConsignacaoDto> {
    return this.registrarDevolucaoConsignadaUseCase.execute({
      idConsignacao,
      idItem,
      quantidade: input.quantidade,
    });
  }
}
