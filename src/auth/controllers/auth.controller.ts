import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '@auth/decorators/public.decorator';
import { AuthMeDto, LoginDto, RegisterDto } from '@auth/dto';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import { AuthService } from '@auth/services';
import { Body } from '@nestjs/common';

type AuthenticatedRequest = {
  user?: JwtPayload;
  cookies?: Record<string, string>;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthMeDto> {
    return this.authService.login(body, response);
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthMeDto> {
    return this.authService.register(body, response);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthMeDto> {
    return this.authService.refresh(
      request.cookies?.['refresh_token'],
      response,
    );
  }

  @Post('logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(request.cookies?.['refresh_token'], response);
  }

  @Get('me')
  async me(@Req() request: AuthenticatedRequest): Promise<AuthMeDto> {
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return this.authService.me(request.user.sub);
  }
}
