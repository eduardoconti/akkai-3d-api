import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import {
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
} from '@financeiro/entities';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  AlterarTaxaMeioPagamentoCarteiraUseCase,
  ExcluirCarteiraUseCase,
  ExcluirCategoriaDespesaUseCase,
  ExcluirDespesaUseCase,
  ExcluirTaxaMeioPagamentoCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
  InserirTaxaMeioPagamentoCarteiraUseCase,
} from '@financeiro/use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carteira, Despesa, CategoriaDespesa, Feira]),
    TypeOrmModule.forFeature([TaxaMeioPagamentoCarteira]),
  ],
  controllers: [FinanceiroController],
  providers: [
    CarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
    FeiraService,
    InserirCarteiraUseCase,
    AlterarCarteiraUseCase,
    InserirDespesaUseCase,
    AlterarDespesaUseCase,
    ExcluirDespesaUseCase,
    ExcluirCarteiraUseCase,
    ExcluirCategoriaDespesaUseCase,
    InserirCategoriaDespesaUseCase,
    AlterarCategoriaDespesaUseCase,
    InserirTaxaMeioPagamentoCarteiraUseCase,
    AlterarTaxaMeioPagamentoCarteiraUseCase,
    ExcluirTaxaMeioPagamentoCarteiraUseCase,
  ],
  exports: [
    CarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
  ],
})
export class FinanceiroModule {}
