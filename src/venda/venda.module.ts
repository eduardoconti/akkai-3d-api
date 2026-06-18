import { FinanceiroModule } from '@financeiro/financeiro.module';
import { Module } from '@nestjs/common';
import { OrcamentoModule } from '@orcamento/orcamento.module';
import { VendaController } from '@venda/controllers';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
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
    PrepararItensVendaService,
    PrepararPagamentosVendaService,
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
    OrcamentoModule,
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
