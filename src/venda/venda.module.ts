import { Module } from '@nestjs/common';
import { VendaController } from '@venda/controllers';
import { VendaService } from '@venda/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feira, ItemVenda, Venda } from '@venda/entities';
import { ProdutoModule } from '@produto/produto.module';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirFeiraUseCase, InserirVendaUseCase],
  imports: [ProdutoModule, TypeOrmModule.forFeature([Venda, ItemVenda, Feira])],
})
export class VendaModule {}
