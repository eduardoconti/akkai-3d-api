import { Module } from '@nestjs/common';
import { VendaController } from '@venda/controllers';
import { VendaService } from '@venda/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemVenda, Venda } from '@venda/entities';
import { ProdutoModule } from '@produto/produto.module';
import { InserirVendaUseCase } from '@venda/use-cases';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirVendaUseCase],
  imports: [ProdutoModule, TypeOrmModule.forFeature([Venda, ItemVenda])],
})
export class VendaModule {}
