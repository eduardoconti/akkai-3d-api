import { Module } from '@nestjs/common';
import { VendaController } from './venda.controller';
import { VendaService } from './venda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.model';
import { ProdutoModule } from 'src/produto/produto.module';
import { InserirVendaUseCase } from './use-case/inserir-venda.use-case';

@Module({
  controllers: [VendaController],
  providers: [VendaService, InserirVendaUseCase],
  imports: [ProdutoModule, TypeOrmModule.forFeature([Venda])],
})
export class VendaModule {}
