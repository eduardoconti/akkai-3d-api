import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { AuthMeDto, LoginDto, RegisterDto } from '@auth/dto';
import {
  Permission,
  RefreshSession,
  Role,
  RolePermission,
  User,
} from '@auth/entities';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

type CookieSameSite = 'lax' | 'strict' | 'none';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository: Repository<RefreshSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, response: Response): Promise<AuthMeDto> {
    const normalizedLogin = dto.login.toLowerCase().trim();
    const existingUser = await this.userRepository.exists({
      where: { login: normalizedLogin },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com esse login.');
    }

    const defaultRole = await this.getOrCreateDefaultRole();
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.getOrThrow<number>('AUTH_BCRYPT_ROUNDS'),
    );

    const user = this.userRepository.create({
      name: dto.name.trim(),
      login: normalizedLogin,
      passwordHash,
      roleId: defaultRole.id,
      isActive: true,
    });

    await this.userRepository.save(user);

    const authenticatedUser = await this.issueSession(user, response);
    return this.toAuthMeDto(authenticatedUser);
  }

  async login(dto: LoginDto, response: Response): Promise<AuthMeDto> {
    const user = await this.findActiveUserByLogin(dto.login);

    if (!user) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const authenticatedUser = await this.issueSession(user, response);
    return this.toAuthMeDto(authenticatedUser);
  }

  async refresh(
    refreshToken: string | undefined,
    response: Response,
  ): Promise<AuthMeDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente.');
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.refreshSessionRepository.findOne({
      where: { id: payload.sessionId, userId: payload.sub },
      relations: {
        user: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, session.tokenHash);

    if (!tokenMatches) {
      await this.revokeSession(session);
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }

    await this.revokeSession(session);

    const authenticatedUser = await this.issueSession(session.user, response);
    return this.toAuthMeDto(authenticatedUser);
  }

  async logout(
    refreshToken: string | undefined,
    response: Response,
  ): Promise<void> {
    if (refreshToken) {
      try {
        const payload = await this.verifyRefreshToken(refreshToken);
        const session = await this.refreshSessionRepository.findOne({
          where: { id: payload.sessionId, userId: payload.sub },
        });

        if (session && !session.revokedAt) {
          await this.revokeSession(session);
        }
      } catch {
        // Ignora token inválido no logout para limpar cookies sempre.
      }
    }

    this.clearAuthCookies(response);
  }

  async me(userId: number): Promise<AuthMeDto> {
    const user = await this.findActiveUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    return this.toAuthMeDto(user);
  }

  async findActiveUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });
  }

  private async findActiveUserByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        login: login.toLowerCase().trim(),
        isActive: true,
      },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });
  }

  private async getOrCreateDefaultRole(): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (existingRole) {
      return existingRole;
    }

    const role = this.roleRepository.create({
      name: 'user',
      description: 'Papel padrão para usuários autenticados.',
    });

    return this.roleRepository.save(role);
  }

  private async issueSession(user: User, response: Response): Promise<User> {
    const authenticatedUser = await this.findActiveUserById(user.id);

    if (!authenticatedUser) {
      throw new ForbiddenException('Usuário inativo ou inexistente.');
    }

    const refreshSession = this.refreshSessionRepository.create({
      userId: authenticatedUser.id,
      expiresAt: this.getRefreshExpiryDate(),
      tokenHash: '',
    });
    const savedSession =
      await this.refreshSessionRepository.save(refreshSession);

    const payload = this.buildJwtPayload(authenticatedUser, savedSession.id);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow<number>('AUTH_ACCESS_TOKEN_TTL_MINUTES')}m`,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.getOrThrow<number>('AUTH_REFRESH_TOKEN_TTL_DAYS')}d`,
    });

    savedSession.tokenHash = await bcrypt.hash(
      refreshToken,
      this.configService.getOrThrow<number>('AUTH_BCRYPT_ROUNDS'),
    );
    await this.refreshSessionRepository.save(savedSession);

    this.setAuthCookies(response, accessToken, refreshToken);

    return authenticatedUser;
  }

  private buildJwtPayload(user: User, sessionId?: string): JwtPayload {
    const permissions = user.role.rolePermissions.map(
      (rolePermission: RolePermission) => rolePermission.permission.name,
    );

    return {
      sub: user.id,
      login: user.login,
      role: user.role.name,
      permissions,
      sessionId,
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  private async revokeSession(session: RefreshSession): Promise<void> {
    session.revokedAt = new Date();
    await this.refreshSessionRepository.save(session);
  }

  private getRefreshExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        this.configService.getOrThrow<number>('AUTH_REFRESH_TOKEN_TTL_DAYS'),
    );
    return expiresAt;
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const sameSite = this.configService.getOrThrow<string>(
      'AUTH_COOKIE_SAME_SITE',
    ) as CookieSameSite;
    const cookieDomain =
      this.configService.get<string>('AUTH_COOKIE_DOMAIN') || undefined;
    const secure = this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain: cookieDomain,
      path: '/',
      maxAge:
        this.configService.getOrThrow<number>('AUTH_ACCESS_TOKEN_TTL_MINUTES') *
        60 *
        1000,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain: cookieDomain,
      path: '/',
      maxAge:
        this.configService.getOrThrow<number>('AUTH_REFRESH_TOKEN_TTL_DAYS') *
        24 *
        60 *
        60 *
        1000,
    });
  }

  clearAuthCookies(response: Response): void {
    const sameSite = this.configService.getOrThrow<string>(
      'AUTH_COOKIE_SAME_SITE',
    ) as CookieSameSite;
    const cookieDomain =
      this.configService.get<string>('AUTH_COOKIE_DOMAIN') || undefined;
    const secure = this.configService.get<string>('NODE_ENV') === 'production';

    response.clearCookie('access_token', {
      httpOnly: true,
      secure,
      sameSite,
      domain: cookieDomain,
      path: '/',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure,
      sameSite,
      domain: cookieDomain,
      path: '/',
    });
  }

  private toAuthMeDto(user: User): AuthMeDto {
    const permissions = user.role.rolePermissions.map(
      (rolePermission: { permission: Permission }) =>
        rolePermission.permission.name,
    );

    return {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role.name,
      permissions,
    };
  }
}
