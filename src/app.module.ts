import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutoModule } from './produto/produto.module';
import { VendaModule } from './venda/venda.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemVenda, Venda } from './venda/venda.model';
import { Produto } from './produto/model/produto.model';
import { CategoriaProduto } from './produto/model/categoria-produto.model';
import { MovimentacaoEstoque } from './produto/model/movimentacao-estoque.model';

@Module({
  imports: [
    ProdutoModule,
    VendaModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [
        Venda,
        ItemVenda,
        Produto,
        MovimentacaoEstoque,
        CategoriaProduto,
      ],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
