import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutoModule } from '@produto/produto.module';
import { VendaModule } from '@venda/venda.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from '@venda/entities/venda.entity';
import { ItemVenda } from '@venda/entities/item-venda.entity';
import { Produto } from '@produto/entities/produto.entity';
import { CategoriaProduto } from '@produto/entities/categoria-produto.entity';
import { MovimentacaoEstoque } from '@produto/entities/movimentacao-estoque.entity';

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
