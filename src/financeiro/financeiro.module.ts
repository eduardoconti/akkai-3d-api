import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import {
  AjusteCarteira,
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
} from '@financeiro/entities';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';
import {
  AjusteCarteiraService,
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
  InserirAjusteCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
  InserirTaxaMeioPagamentoCarteiraUseCase,
} from '@financeiro/use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AjusteCarteira,
      Carteira,
      Despesa,
      CategoriaDespesa,
      Feira,
    ]),
    TypeOrmModule.forFeature([TaxaMeioPagamentoCarteira]),
  ],
  controllers: [FinanceiroController],
  providers: [
    CarteiraService,
    AjusteCarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
    FeiraService,
    InserirAjusteCarteiraUseCase,
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
    AjusteCarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
  ],
})
export class FinanceiroModule {}
