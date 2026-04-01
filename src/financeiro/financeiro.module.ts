import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from '@financeiro/controllers';
import { Carteira, Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
import {
  InserirCarteiraUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Carteira, Despesa])],
  controllers: [FinanceiroController],
  providers: [FinanceiroService, InserirCarteiraUseCase, InserirDespesaUseCase],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
