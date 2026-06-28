import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Orcamento } from '@orcamento/entities';
import {
  Consignacao,
  ItemConsignacao,
  Revendedor,
} from '@consignacao/entities';
import {
  Permission,
  RefreshSession,
  Role,
  RolePermission,
  User,
} from '@auth/entities';
import {
  AjusteCarteira,
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
  TransferenciaCarteira,
} from '@financeiro/entities';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  Produto,
} from '@produto/entities';
import {
  Feira,
  ItemTrocaDevolucao,
  ItemVenda,
  PagamentoVenda,
  PrecoProdutoFeira,
  TrocaDevolucao,
  Venda,
} from '@venda/entities';
import {
  Assinante,
  CicloAssinatura,
  ItemCicloAssinatura,
  ItemKitMensal,
  KitMensal,
  PlanoAssinatura,
} from '@assinatura/entities';
import { DataSourceOptions } from 'typeorm';

type DatabaseEnv = {
  NODE_ENV: 'development' | 'test' | 'production';
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
  Orcamento,
  Venda,
  ItemVenda,
  PagamentoVenda,
  TrocaDevolucao,
  ItemTrocaDevolucao,
  Feira,
  PrecoProdutoFeira,
  Produto,
  MovimentacaoEstoque,
  CategoriaProduto,
  Carteira,
  CategoriaDespesa,
  Despesa,
  AjusteCarteira,
  TaxaMeioPagamentoCarteira,
  TransferenciaCarteira,
  User,
  Role,
  Permission,
  RolePermission,
  RefreshSession,
  PlanoAssinatura,
  Assinante,
  CicloAssinatura,
  ItemCicloAssinatura,
  KitMensal,
  ItemKitMensal,
  Revendedor,
  Consignacao,
  ItemConsignacao,
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
    synchronize:
      env.NODE_ENV === 'production' ? false : env.DATABASE_SYNCHRONIZE,
    logging: env.DATABASE_LOGGING,
  };
}

export function getDatabaseConfigFromConfigService(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return getDatabaseConfig({
    NODE_ENV: configService.getOrThrow<DatabaseEnv['NODE_ENV']>('NODE_ENV'),
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
