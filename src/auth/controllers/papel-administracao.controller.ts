import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import { PapelComPermissoesDto, SalvarPapelDto } from '@auth/dto';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { PapelService } from '@auth/services';
import {
  ApiAdministracaoPapeisDocs,
  ApiAtualizarPapelDocs,
  ApiCriarPapelDocs,
  ApiExcluirPapelDocs,
} from '@auth/docs/papel-administracao-docs.decorator';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@ApiProtectedController('Administração de papéis')
@Controller('auth/administracao/papeis')
export class PapelAdministracaoController {
  constructor(private readonly papelService: PapelService) {}

  @ApiAdministracaoPapeisDocs()
  @Get()
  @Permissions(PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES)
  async listar(): Promise<PapelComPermissoesDto[]> {
    return this.papelService.listar();
  }

  @ApiCriarPapelDocs()
  @Post()
  @Permissions(PERMISSOES.PAPEL.ADMINISTRAR)
  async criar(
    @Body() body: SalvarPapelDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PapelComPermissoesDto> {
    return this.papelService.criar(body, this.obterAtor(request));
  }

  @ApiAtualizarPapelDocs()
  @Put(':id')
  @Permissions(PERMISSOES.PAPEL.ADMINISTRAR)
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SalvarPapelDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PapelComPermissoesDto> {
    return this.papelService.atualizar(id, body, this.obterAtor(request));
  }

  @ApiExcluirPapelDocs()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(PERMISSOES.PAPEL.ADMINISTRAR)
  async excluir(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.papelService.excluir(id);
  }

  private obterAtor(request: AuthenticatedRequest): JwtPayload {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return request.user;
  }
}
