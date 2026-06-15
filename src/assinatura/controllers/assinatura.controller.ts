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
import {
  AlterarAssinanteDto,
  AlterarCicloDto,
  AlterarKitMensalDto,
  AlterarPlanoDto,
  InserirAssinanteDto,
  InserirCicloDto,
  InserirKitMensalDto,
  InserirPlanoDto,
  PesquisarAssinantesDto,
  PesquisarCiclosDto,
  PesquisarKitsDto,
  PesquisarPlanosDto,
} from '@assinatura/dto';
import {
  Assinante,
  CicloAssinatura,
  KitMensal,
  PlanoAssinatura,
  StatusAssinante,
  StatusCiclo,
} from '@assinatura/entities';
import {
  AssinanteService,
  CicloService,
  KitMensalService,
  PlanoService,
} from '@assinatura/services';
import {
  AlterarAssinanteUseCase,
  AlterarCicloUseCase,
  AlterarKitMensalUseCase,
  AlterarPlanoUseCase,
  ExcluirAssinanteUseCase,
  ExcluirCicloUseCase,
  ExcluirKitMensalUseCase,
  ExcluirPlanoUseCase,
  GerarCiclosMensaisUseCase,
  GerarCiclosResult,
  InserirAssinanteUseCase,
  InserirCicloUseCase,
  InserirKitMensalUseCase,
  InserirPlanoUseCase,
} from '@assinatura/use-cases';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import {
  ApiAlterarAssinanteDocs,
  ApiAlterarCicloDocs,
  ApiAlterarKitMensalDocs,
  ApiAlterarPlanoDocs,
  ApiExcluirAssinanteDocs,
  ApiExcluirCicloDocs,
  ApiExcluirKitMensalDocs,
  ApiExcluirPlanoDocs,
  ApiGerarCiclosMensaisDocs,
  ApiInserirAssinanteDocs,
  ApiInserirCicloDocs,
  ApiInserirKitMensalDocs,
  ApiInserirPlanoDocs,
  ApiListarPlanosDocs,
  ApiObterAssinantePorIdDocs,
  ApiObterCicloPorIdDocs,
  ApiObterKitMensalPorIdDocs,
  ApiObterPlanoPorIdDocs,
  ApiPesquisarAssinantesDocs,
  ApiPesquisarCiclosDocs,
  ApiPesquisarKitsDocs,
  ApiPesquisarPlanosDocs,
} from '@assinatura/docs/assinatura-docs.decorator';

@ApiProtectedController('Assinatura')
@Controller('assinatura')
export class AssinaturaController {
  constructor(
    private readonly planoService: PlanoService,
    private readonly assinanteService: AssinanteService,
    private readonly cicloService: CicloService,
    private readonly kitMensalService: KitMensalService,
    private readonly inserirPlanoUseCase: InserirPlanoUseCase,
    private readonly alterarPlanoUseCase: AlterarPlanoUseCase,
    private readonly excluirPlanoUseCase: ExcluirPlanoUseCase,
    private readonly inserirAssinanteUseCase: InserirAssinanteUseCase,
    private readonly alterarAssinanteUseCase: AlterarAssinanteUseCase,
    private readonly excluirAssinanteUseCase: ExcluirAssinanteUseCase,
    private readonly inserirCicloUseCase: InserirCicloUseCase,
    private readonly alterarCicloUseCase: AlterarCicloUseCase,
    private readonly excluirCicloUseCase: ExcluirCicloUseCase,
    private readonly inserirKitMensalUseCase: InserirKitMensalUseCase,
    private readonly alterarKitMensalUseCase: AlterarKitMensalUseCase,
    private readonly excluirKitMensalUseCase: ExcluirKitMensalUseCase,
    private readonly gerarCiclosMensaisUseCase: GerarCiclosMensaisUseCase,
  ) {}

  @ApiInserirPlanoDocs()
  @Post('planos')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.INSERIR)
  async inserirPlano(@Body() input: InserirPlanoDto): Promise<PlanoAssinatura> {
    return this.inserirPlanoUseCase.execute({
      nome: input.nome,
      descricao: input.descricao,
      valor: input.valor,
      ativo: input.ativo ?? true,
      slug: input.slug,
      resumo: input.resumo,
      destaque: input.destaque,
      faixaEtaria: input.faixaEtaria,
      itensInclusos: input.itensInclusos,
      beneficios: input.beneficios,
    });
  }

  @ApiListarPlanosDocs()
  @Get('planos')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.LER)
  async listarPlanos(): Promise<PlanoAssinatura[]> {
    return this.planoService.listarPlanos();
  }

  @ApiPesquisarPlanosDocs()
  @Get('planos/paginado')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.LER)
  async pesquisarPlanos(
    @Query() pesquisa: PesquisarPlanosDto,
  ): Promise<ResultadoPaginado<PlanoAssinatura>> {
    return this.planoService.pesquisarPlanos(pesquisa);
  }

  @ApiObterPlanoPorIdDocs()
  @Get('planos/:id')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.LER)
  async obterPlanoPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlanoAssinatura> {
    return this.planoService.garantirPlanoPorId(id);
  }

  @ApiAlterarPlanoDocs()
  @Put('planos/:id')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.ALTERAR)
  async alterarPlano(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarPlanoDto,
  ): Promise<PlanoAssinatura> {
    return this.alterarPlanoUseCase.execute({
      id,
      nome: input.nome,
      descricao: input.descricao,
      valor: input.valor,
      ativo: input.ativo,
      slug: input.slug,
      resumo: input.resumo,
      destaque: input.destaque,
      faixaEtaria: input.faixaEtaria,
      itensInclusos: input.itensInclusos,
      beneficios: input.beneficios,
    });
  }

  @ApiExcluirPlanoDocs()
  @Delete('planos/:id')
  @Permissions(PERMISSOES.ASSINATURA.PLANO.EXCLUIR)
  async excluirPlano(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.excluirPlanoUseCase.execute({ id });
  }

  @ApiInserirAssinanteDocs()
  @Post('assinantes')
  @Permissions(PERMISSOES.ASSINATURA.ASSINANTE.INSERIR)
  async inserirAssinante(
    @Body() input: InserirAssinanteDto,
  ): Promise<Assinante> {
    return this.inserirAssinanteUseCase.execute({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      enderecoEntrega: input.enderecoEntrega,
      idPlano: input.idPlano,
      status: input.status ?? StatusAssinante.ATIVO,
    });
  }

  @ApiPesquisarAssinantesDocs()
  @Get('assinantes')
  @Permissions(PERMISSOES.ASSINATURA.ASSINANTE.LER)
  async pesquisarAssinantes(
    @Query() pesquisa: PesquisarAssinantesDto,
  ): Promise<ResultadoPaginado<Assinante>> {
    return this.assinanteService.pesquisarAssinantes(pesquisa);
  }

  @ApiObterAssinantePorIdDocs()
  @Get('assinantes/:id')
  @Permissions(PERMISSOES.ASSINATURA.ASSINANTE.LER)
  async obterAssinantePorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Assinante> {
    return this.assinanteService.garantirAssinantePorId(id);
  }

  @ApiAlterarAssinanteDocs()
  @Put('assinantes/:id')
  @Permissions(PERMISSOES.ASSINATURA.ASSINANTE.ALTERAR)
  async alterarAssinante(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarAssinanteDto,
  ): Promise<Assinante> {
    return this.alterarAssinanteUseCase.execute({ id, ...input });
  }

  @ApiExcluirAssinanteDocs()
  @Delete('assinantes/:id')
  @Permissions(PERMISSOES.ASSINATURA.ASSINANTE.EXCLUIR)
  async excluirAssinante(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.excluirAssinanteUseCase.execute({ id });
  }

  @ApiInserirCicloDocs()
  @Post('ciclos')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.INSERIR)
  async inserirCiclo(@Body() input: InserirCicloDto): Promise<CicloAssinatura> {
    return this.inserirCicloUseCase.execute({
      idAssinante: input.idAssinante,
      mesReferencia: input.mesReferencia,
      anoReferencia: input.anoReferencia,
      status: input.status ?? StatusCiclo.PENDENTE,
      codigoRastreio: input.codigoRastreio,
      observacao: input.observacao,
      itens: input.itens,
    });
  }

  @ApiPesquisarCiclosDocs()
  @Get('ciclos')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.LER)
  async pesquisarCiclos(
    @Query() pesquisa: PesquisarCiclosDto,
  ): Promise<ResultadoPaginado<CicloAssinatura>> {
    return this.cicloService.pesquisarCiclos(pesquisa);
  }

  @ApiObterCicloPorIdDocs()
  @Get('ciclos/:id')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.LER)
  async obterCicloPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CicloAssinatura> {
    return this.cicloService.garantirCicloPorId(id);
  }

  @ApiAlterarCicloDocs()
  @Put('ciclos/:id')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.ALTERAR)
  async alterarCiclo(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarCicloDto,
  ): Promise<CicloAssinatura> {
    return this.alterarCicloUseCase.execute({ id, ...input });
  }

  @ApiExcluirCicloDocs()
  @Delete('ciclos/:id')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.EXCLUIR)
  async excluirCiclo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.excluirCicloUseCase.execute({ id });
  }

  @ApiInserirKitMensalDocs()
  @Post('kits')
  @Permissions(PERMISSOES.ASSINATURA.KIT_MENSAL.INSERIR)
  async inserirKitMensal(
    @Body() input: InserirKitMensalDto,
  ): Promise<KitMensal> {
    return this.inserirKitMensalUseCase.execute({
      idPlano: input.idPlano,
      mesReferencia: input.mesReferencia,
      anoReferencia: input.anoReferencia,
      itens: input.itens,
      titulo: input.titulo,
      descricao: input.descricao,
      chamada: input.chamada,
      ativo: input.ativo,
      itensVitrine: input.itensVitrine,
    });
  }

  @ApiPesquisarKitsDocs()
  @Get('kits')
  @Permissions(PERMISSOES.ASSINATURA.KIT_MENSAL.LER)
  async pesquisarKits(
    @Query() pesquisa: PesquisarKitsDto,
  ): Promise<ResultadoPaginado<KitMensal>> {
    return this.kitMensalService.pesquisarKits(pesquisa);
  }

  @ApiObterKitMensalPorIdDocs()
  @Get('kits/:id')
  @Permissions(PERMISSOES.ASSINATURA.KIT_MENSAL.LER)
  async obterKitMensalPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<KitMensal> {
    return this.kitMensalService.garantirKitPorId(id);
  }

  @ApiAlterarKitMensalDocs()
  @Put('kits/:id')
  @Permissions(PERMISSOES.ASSINATURA.KIT_MENSAL.ALTERAR)
  async alterarKitMensal(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: AlterarKitMensalDto,
  ): Promise<KitMensal> {
    return this.alterarKitMensalUseCase.execute({
      id,
      itens: input.itens,
      titulo: input.titulo,
      descricao: input.descricao,
      chamada: input.chamada,
      ativo: input.ativo,
      itensVitrine: input.itensVitrine,
    });
  }

  @ApiExcluirKitMensalDocs()
  @Delete('kits/:id')
  @Permissions(PERMISSOES.ASSINATURA.KIT_MENSAL.EXCLUIR)
  async excluirKitMensal(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.excluirKitMensalUseCase.execute({ id });
  }

  @ApiGerarCiclosMensaisDocs()
  @Post('kits/:id/gerar-ciclos')
  @Permissions(PERMISSOES.ASSINATURA.CICLO.GERAR)
  async gerarCiclosMensais(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GerarCiclosResult> {
    return this.gerarCiclosMensaisUseCase.execute(id);
  }
}
