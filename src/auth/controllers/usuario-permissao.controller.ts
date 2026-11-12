import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { Permissions } from '@auth/decorators/permissions.decorator';
import {
  DefinirPermissoesUsuarioDto,
  PermissaoDisponivelDto,
  PermissoesUsuarioDto,
  UsuarioAdministravelDto,
} from '@auth/dto';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { PermissaoUsuarioService } from '@auth/services';
import {
  ApiAdministracaoPermissoesDocs,
  ApiAdministracaoUsuarioPermissoesDocs,
  ApiAdministracaoUsuariosDocs,
  ApiDefinirPermissoesUsuarioDocs,
} from '@auth/docs/usuario-permissao-docs.decorator';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@ApiProtectedController('Administração de permissões')
@Controller('auth/administracao')
@Permissions(PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES)
export class UsuarioPermissaoController {
  constructor(
    private readonly permissaoUsuarioService: PermissaoUsuarioService,
  ) {}

  @ApiAdministracaoUsuariosDocs()
  @Get('usuarios')
  async listarUsuarios(): Promise<UsuarioAdministravelDto[]> {
    return this.permissaoUsuarioService.listarUsuarios();
  }

  @ApiAdministracaoPermissoesDocs()
  @Get('permissoes')
  async listarPermissoes(): Promise<PermissaoDisponivelDto[]> {
    return this.permissaoUsuarioService.listarPermissoes();
  }

  @ApiAdministracaoUsuarioPermissoesDocs()
  @Get('usuarios/:id/permissoes')
  async obterPermissoes(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PermissoesUsuarioDto> {
    return this.permissaoUsuarioService.obterPermissoes(id);
  }

  @ApiDefinirPermissoesUsuarioDocs()
  @Put('usuarios/:id/permissoes')
  async definirPermissoes(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DefinirPermissoesUsuarioDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PermissoesUsuarioDto> {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return this.permissaoUsuarioService.definirPermissoes(
      id,
      body,
      request.user,
    );
  }
}
