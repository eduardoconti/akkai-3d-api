import { Module } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './model/produto.model';
import { InserirProdutoUseCase } from './use-case/inserir-produto.use-case';
import { CategoriaProduto } from './model/categoria-produto.model';
import { MovimentacaoEstoque } from './model/movimentacao-estoque.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService, InserirProdutoUseCase],
  exports: [ProdutoService],
})
export class ProdutoModule {}
