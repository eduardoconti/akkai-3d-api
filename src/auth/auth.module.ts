import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from '@auth/controllers';
import {
  Permission,
  RefreshSession,
  Role,
  RolePermission,
  User,
} from '@auth/entities';
import { JwtAuthGuard, PermissionsGuard } from '@auth/guards';
import { AuthService } from '@auth/services';
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
      RefreshSession,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
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
  exports: [AuthService],
})
export class AuthModule {}
