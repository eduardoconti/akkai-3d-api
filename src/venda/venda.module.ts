import { FinanceiroModule } from '@financeiro/financeiro.module';
import { Module } from '@nestjs/common';
import { VendaController } from '@venda/controllers';
import { VendaService } from '@venda/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feira, ItemVenda, Venda } from '@venda/entities';
import { ProdutoModule } from '@produto/produto.module';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';
import { Carteira } from '@financeiro/entities';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirFeiraUseCase, InserirVendaUseCase],
  imports: [
    ProdutoModule,
    FinanceiroModule,
    TypeOrmModule.forFeature([Venda, ItemVenda, Feira, Carteira]),
  ],
})
export class VendaModule {}
