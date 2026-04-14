import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import { Carteira, CategoriaDespesa, Despesa } from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  ExcluirDespesaUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Carteira, Despesa, CategoriaDespesa])],
  controllers: [FinanceiroController],
  providers: [
    CarteiraService,
    DespesaService,
    CategoriaDespesaService,
    InserirCarteiraUseCase,
    AlterarCarteiraUseCase,
    InserirDespesaUseCase,
    AlterarDespesaUseCase,
    ExcluirDespesaUseCase,
    InserirCategoriaDespesaUseCase,
    AlterarCategoriaDespesaUseCase,
  ],
  exports: [CarteiraService, DespesaService, CategoriaDespesaService],
})
export class FinanceiroModule {}
