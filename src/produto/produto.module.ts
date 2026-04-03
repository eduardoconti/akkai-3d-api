import { Module } from '@nestjs/common';
import { ProdutoController } from '@produto/controllers';
import {
  CategoriaProdutoService,
  EstoqueService,
  ProdutoService,
} from '@produto/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  Produto,
} from '@produto/entities';
import {
  AlterarCategoriaProdutoUseCase,
  AlterarProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
} from '@produto/use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [
    ProdutoService,
    CategoriaProdutoService,
    EstoqueService,
    AlterarCategoriaProdutoUseCase,
    InserirProdutoUseCase,
    AlterarProdutoUseCase,
    InserirCategoriaProdutoUseCase,
  ],
  exports: [ProdutoService, CategoriaProdutoService, EstoqueService],
})
export class ProdutoModule {}
