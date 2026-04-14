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
  EntradaEstoqueUseCase,
  ExcluirCategoriaProdutoUseCase,
  ExcluirProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
  SaidaEstoqueUseCase,
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
    EntradaEstoqueUseCase,
    InserirProdutoUseCase,
    AlterarProdutoUseCase,
    ExcluirProdutoUseCase,
    ExcluirCategoriaProdutoUseCase,
    InserirCategoriaProdutoUseCase,
    SaidaEstoqueUseCase,
  ],
  exports: [ProdutoService, CategoriaProdutoService, EstoqueService],
})
export class ProdutoModule {}
