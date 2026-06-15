import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import {
  AjusteCarteira,
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
  TransferenciaCarteira,
} from '@financeiro/entities';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';
import {
  AjusteCarteiraService,
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
  TaxaMeioPagamentoCarteiraService,
  TransferenciaCarteiraService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  AlterarTransferenciaCarteiraUseCase,
  AlterarTaxaMeioPagamentoCarteiraUseCase,
  ExcluirCarteiraUseCase,
  ExcluirCategoriaDespesaUseCase,
  ExcluirDespesaUseCase,
  ExcluirTransferenciaCarteiraUseCase,
  ExcluirTaxaMeioPagamentoCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirAjusteCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
  InserirTaxaMeioPagamentoCarteiraUseCase,
  InserirTransferenciaCarteiraUseCase,
} from '@financeiro/use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AjusteCarteira,
      Carteira,
      Despesa,
      CategoriaDespesa,
      TransferenciaCarteira,
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
    TransferenciaCarteiraService,
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
    InserirTransferenciaCarteiraUseCase,
    AlterarTransferenciaCarteiraUseCase,
    ExcluirTransferenciaCarteiraUseCase,
    AlterarTaxaMeioPagamentoCarteiraUseCase,
    ExcluirTaxaMeioPagamentoCarteiraUseCase,
  ],
  exports: [
    CarteiraService,
    AjusteCarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
    TransferenciaCarteiraService,
  ],
})
export class FinanceiroModule {}
