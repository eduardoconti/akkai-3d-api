import { Module } from '@nestjs/common';
import { ProdutoController } from '@produto/produto.controller';
import { ProdutoService } from '@produto/services/produto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from '@produto/entities/produto.entity';
import { InserirProdutoUseCase } from '@produto/use-cases/inserir-produto.use-case';
import { CategoriaProduto } from '@produto/entities/categoria-produto.entity';
import { MovimentacaoEstoque } from '@produto/entities/movimentacao-estoque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService, InserirProdutoUseCase],
  exports: [ProdutoService],
})
export class ProdutoModule {}
