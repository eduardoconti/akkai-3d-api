import { Module } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './services/produto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './entities/produto.entity';
import { InserirProdutoUseCase } from './use-cases/inserir-produto.use-case';
import { CategoriaProduto } from './entities/categoria-produto.entity';
import { MovimentacaoEstoque } from './entities/movimentacao-estoque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService, InserirProdutoUseCase],
  exports: [ProdutoService],
})
export class ProdutoModule {}
