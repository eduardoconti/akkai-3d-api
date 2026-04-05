import { AuthModule } from '@auth/auth.module';
import { FinanceiroModule } from '@financeiro/financeiro.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutoModule } from '@produto/produto.module';
import { OrcamentoModule } from '@orcamento/orcamento.module';
import { RelatorioModule } from '@relatorio/relatorio.module';
import { VendaModule } from '@venda/venda.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';
import { getDatabaseConfigFromConfigService } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    AuthModule,
    FinanceiroModule,
    OrcamentoModule,
    ProdutoModule,
    RelatorioModule,
    VendaModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfigFromConfigService(configService),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
