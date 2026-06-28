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
import { FeiraModule } from '@venda/feira.module';
import { ConsultaCarteira, ConsultaTaxaPagamento } from '@financeiro/contracts';
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
  exports: [ConsultaCarteira, ConsultaTaxaPagamento],
})
export class FinanceiroModule {}
