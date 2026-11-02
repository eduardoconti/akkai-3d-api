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
  AlterarStatusProdutoUseCase,
  EntradaEstoqueUseCase,
  ExcluirCategoriaProdutoUseCase,
  ExcluirProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
  SaidaEstoqueUseCase,
} from '@produto/use-cases';
import { ConsultaProduto } from '@produto/contracts';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, CategoriaProduto, MovimentacaoEstoque]),
  ],
  controllers: [ProdutoController],
  providers: [
    ProdutoService,
    { provide: ConsultaProduto, useExisting: ProdutoService },
    CategoriaProdutoService,
    EstoqueService,
    AlterarCategoriaProdutoUseCase,
    EntradaEstoqueUseCase,
    InserirProdutoUseCase,
    AlterarProdutoUseCase,
    AlterarStatusProdutoUseCase,
    ExcluirProdutoUseCase,
    ExcluirCategoriaProdutoUseCase,
    InserirCategoriaProdutoUseCase,
    SaidaEstoqueUseCase,
  ],
  exports: [ConsultaProduto],
})
export class ProdutoModule {}
