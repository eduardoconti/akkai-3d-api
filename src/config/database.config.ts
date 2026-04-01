import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import {
  Permission,
  RefreshSession,
  Role,
  RolePermission,
  User,
} from '@auth/entities';
import { Carteira, Despesa } from '@financeiro/entities';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  Produto,
} from '@produto/entities';
import { Feira, ItemVenda, Venda } from '@venda/entities';
import { DataSourceOptions } from 'typeorm';

type DatabaseEnv = {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SSL: boolean;
  DATABASE_SYNCHRONIZE: boolean;
  DATABASE_LOGGING: boolean;
};

const entities = [
  Venda,
  ItemVenda,
  Feira,
  Produto,
  MovimentacaoEstoque,
  CategoriaProduto,
  Carteira,
  Despesa,
  User,
  Role,
  Permission,
  RolePermission,
  RefreshSession,
];

export function getDatabaseConfig(env: DatabaseEnv): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: env.DATABASE_SSL,
    entities,
    migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
    synchronize: env.DATABASE_SYNCHRONIZE,
    logging: env.DATABASE_LOGGING,
  };
}

export function getDatabaseConfigFromConfigService(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return getDatabaseConfig({
    DATABASE_HOST: configService.getOrThrow<string>('DATABASE_HOST'),
    DATABASE_PORT: configService.getOrThrow<number>('DATABASE_PORT'),
    DATABASE_USERNAME: configService.getOrThrow<string>('DATABASE_USERNAME'),
    DATABASE_PASSWORD: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    DATABASE_NAME: configService.getOrThrow<string>('DATABASE_NAME'),
    DATABASE_SSL: configService.getOrThrow<boolean>('DATABASE_SSL'),
    DATABASE_SYNCHRONIZE: configService.getOrThrow<boolean>(
      'DATABASE_SYNCHRONIZE',
    ),
    DATABASE_LOGGING: configService.getOrThrow<boolean>('DATABASE_LOGGING'),
  });
}
