import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import { Carteira, CategoriaDespesa, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
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
    FinanceiroService,
    InserirCarteiraUseCase,
    AlterarCarteiraUseCase,
    InserirDespesaUseCase,
    AlterarDespesaUseCase,
    ExcluirDespesaUseCase,
    InserirCategoriaDespesaUseCase,
    AlterarCategoriaDespesaUseCase,
  ],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
