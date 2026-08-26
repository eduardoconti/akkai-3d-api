import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import {
  AjusteCarteira,
  Caixa,
  Carteira,
  CategoriaDespesa,
  Despesa,
  TaxaMeioPagamentoCarteira,
  TransferenciaCarteira,
  ConferenciaCarteiraCaixa,
} from '@financeiro/entities';
import { FeiraModule } from '@venda/feira.module';
import {
  ConsultaCaixa,
  ConsultaCarteira,
  ConsultaTaxaPagamento,
} from '@financeiro/contracts';
import {
  AjusteCarteiraService,
  CarteiraService,
  CaixaService,
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
      Caixa,
      Carteira,
      Despesa,
      CategoriaDespesa,
      TransferenciaCarteira,
      ConferenciaCarteiraCaixa,
    ]),
    TypeOrmModule.forFeature([TaxaMeioPagamentoCarteira]),
    FeiraModule,
  ],
  controllers: [FinanceiroController],
  providers: [
    CarteiraService,
    AjusteCarteiraService,
    DespesaService,
    CategoriaDespesaService,
    TaxaMeioPagamentoCarteiraService,
    TransferenciaCarteiraService,
    CaixaService,
    { provide: ConsultaCaixa, useExisting: CaixaService },
    {
      provide: ConsultaCarteira,
      useExisting: CarteiraService,
    },
    {
      provide: ConsultaTaxaPagamento,
      useExisting: TaxaMeioPagamentoCarteiraService,
    },
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
  exports: [ConsultaCarteira, ConsultaTaxaPagamento, ConsultaCaixa],
})
export class FinanceiroModule {}
