import { Module } from '@nestjs/common';
import { ProdutoController } from '@produto/controllers';
import { ProdutoService } from '@produto/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  Produto,
} from '@produto/entities';
import { InserirProdutoUseCase } from '@produto/use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService, InserirProdutoUseCase],
  exports: [ProdutoService],
})
export class ProdutoModule {}
