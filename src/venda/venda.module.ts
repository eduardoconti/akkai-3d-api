import { Module } from '@nestjs/common';
import { VendaController } from './venda.controller';
import { VendaService } from './services/venda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './entities/venda.entity';
import { ItemVenda } from './entities/item-venda.entity';
import { ProdutoModule } from 'src/produto/produto.module';
import { InserirVendaUseCase } from './use-cases/inserir-venda.use-case';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirVendaUseCase],
  imports: [ProdutoModule, TypeOrmModule.forFeature([Venda, ItemVenda])],
})
export class VendaModule {}
