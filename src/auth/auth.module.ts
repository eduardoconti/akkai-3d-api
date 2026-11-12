import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  AuthController,
  PapelAdministracaoController,
  UsuarioPermissaoController,
} from '@auth/controllers';
import {
  Permission,
  RefreshSession,
  Role,
  RolePermission,
  User,
  UserPermission,
} from '@auth/entities';
import { JwtAuthGuard, PermissionsGuard } from '@auth/guards';
import {
  AuthService,
  PapelService,
  PermissaoUsuarioService,
} from '@auth/services';
import { JwtStrategy } from '@auth/strategies';

@Module({
  imports: [
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => [
        {
          ttl: 60_000,
          limit: 20,
        },
      ],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      RolePermission,
      UserPermission,
      RefreshSession,
    ]),
  ],
  controllers: [
    AuthController,
    UsuarioPermissaoController,
    PapelAdministracaoController,
  ],
  providers: [
    AuthService,
    PermissaoUsuarioService,
    PapelService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AuthModule {}
