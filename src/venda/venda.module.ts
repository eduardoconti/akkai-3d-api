import { FinanceiroModule } from '@financeiro/financeiro.module';
import { Module } from '@nestjs/common';
import { VendaController } from '@venda/controllers';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Feira,
  ItemVenda,
  PagamentoVenda,
  PrecoProdutoFeira,
  Venda,
} from '@venda/entities';
import { ProdutoModule } from '@produto/produto.module';
import {
  AlterarFeiraUseCase,
  AlterarVendaUseCase,
  ExcluirFeiraUseCase,
  ExcluirVendaUseCase,
  InserirFeiraUseCase,
  InserirVendaUseCase,
} from '@venda/use-cases';
import { Carteira } from '@financeiro/entities';

@Module({
  controllers: [VendaController],
  providers: [
    VendaService,
    FeiraService,
    PrecoProdutoFeiraService,
    InserirFeiraUseCase,
    AlterarFeiraUseCase,
    ExcluirFeiraUseCase,
    InserirVendaUseCase,
    AlterarVendaUseCase,
    ExcluirVendaUseCase,
  ],
  imports: [
    ProdutoModule,
    FinanceiroModule,
    TypeOrmModule.forFeature([
      Venda,
      ItemVenda,
      PagamentoVenda,
      Feira,
      PrecoProdutoFeira,
      Carteira,
    ]),
  ],
})
export class VendaModule {}
