import { FinanceiroModule } from '@financeiro/financeiro.module';
import { Module } from '@nestjs/common';
import { OrcamentoModule } from '@orcamento/orcamento.module';
import { VendaController } from '@venda/controllers';
import {
  PrecoProdutoFeiraService,
  PrepararItensVendaService,
  PrepararPagamentosVendaService,
  TrocaDevolucaoService,
  VendaService,
} from '@venda/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ItemVenda,
  PagamentoVenda,
  PrecoProdutoFeira,
  ItemTrocaDevolucao,
  TrocaDevolucao,
  Venda,
} from '@venda/entities';
import { ProdutoModule } from '@produto/produto.module';
import {
  AlterarFeiraUseCase,
  AlterarVendaUseCase,
  ExcluirFeiraUseCase,
  ExcluirVendaUseCase,
  InserirFeiraUseCase,
  InserirTrocaDevolucaoUseCase,
  InserirVendaUseCase,
} from '@venda/use-cases';
import { FeiraModule } from '@venda/feira.module';

@Module({
  controllers: [VendaController],
  providers: [
    VendaService,
    PrecoProdutoFeiraService,
    PrepararItensVendaService,
    PrepararPagamentosVendaService,
    TrocaDevolucaoService,
    InserirFeiraUseCase,
    AlterarFeiraUseCase,
    ExcluirFeiraUseCase,
    InserirTrocaDevolucaoUseCase,
    InserirVendaUseCase,
    AlterarVendaUseCase,
    ExcluirVendaUseCase,
  ],
  imports: [
    ProdutoModule,
    FinanceiroModule,
    FeiraModule,
    OrcamentoModule,
    TypeOrmModule.forFeature([
      Venda,
      ItemVenda,
      PagamentoVenda,
      TrocaDevolucao,
      ItemTrocaDevolucao,
      PrecoProdutoFeira,
    ]),
  ],
})
export class VendaModule {}
