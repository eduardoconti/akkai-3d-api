import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '@auth/decorators/public.decorator';
import {
  AlterarCadastroDto,
  AlterarSenhaDto,
  AuthResponseDto,
  LoginDto,
  LogoutDto,
  PapelUsuarioDto,
  RefreshTokenDto,
  RegisterDto,
  UsuarioAutenticadoDto,
} from '@auth/dto';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { AuthService } from '@auth/services';
import {
  ApiAuthLoginDocs,
  ApiAuthLogoutDocs,
  ApiAuthMeDocs,
  ApiAuthRolesDocs,
  ApiAuthRefreshDocs,
  ApiAuthRegisterDocs,
  ApiAuthUpdatePasswordDocs,
  ApiAuthUpdateProfileDocs,
} from '@auth/docs/auth-docs.decorator';
import { ApiAccessCookieAuth } from '@common/docs/decorators/api-cookie-auth.decorator';
import { ApiPublicController } from '@common/docs/decorators/api-controller-docs.decorator';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@ApiPublicController('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiAuthLoginDocs()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(body);
  }

  @ApiAuthRegisterDocs()
  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(body);
  }

  @ApiAccessCookieAuth()
  @ApiAuthRefreshDocs()
  @Public()
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(body.refreshToken);
  }

  @ApiAccessCookieAuth()
  @ApiAuthLogoutDocs()
  @Post('logout')
  async logout(@Body() body: LogoutDto): Promise<void> {
    await this.authService.logout(body.refreshToken);
  }

  @ApiAccessCookieAuth()
  @ApiAuthMeDocs()
  @Get('me')
  async me(
    @Req() request: AuthenticatedRequest,
  ): Promise<UsuarioAutenticadoDto> {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return this.authService.me(request.user.sub);
  }

  @ApiAccessCookieAuth()
  @ApiAuthRolesDocs()
  @Get('roles')
  async listRoles(): Promise<PapelUsuarioDto[]> {
    return this.authService.listRoles();
  }

  @ApiAccessCookieAuth()
  @ApiAuthUpdateProfileDocs()
  @Put('me')
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: AlterarCadastroDto,
  ): Promise<AuthResponseDto | UsuarioAutenticadoDto> {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return this.authService.updateProfile(
      request.user.sub,
      body,
      request.user.permissions,
    );
  }

  @ApiAccessCookieAuth()
  @ApiAuthUpdatePasswordDocs()
  @Put('me/password')
  async updatePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: AlterarSenhaDto,
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    await this.authService.updatePassword(request.user.sub, body);
  }
}
