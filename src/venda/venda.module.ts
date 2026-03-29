import { Module } from '@nestjs/common';
import { VendaController } from '@venda/venda.controller';
import { VendaService } from '@venda/services/venda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from '@venda/entities/venda.entity';
import { ItemVenda } from '@venda/entities/item-venda.entity';
import { ProdutoModule } from '@produto/produto.module';
import { InserirVendaUseCase } from '@venda/use-cases/inserir-venda.use-case';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirVendaUseCase],
  imports: [ProdutoModule, TypeOrmModule.forFeature([Venda, ItemVenda])],
})
export class VendaModule {}
