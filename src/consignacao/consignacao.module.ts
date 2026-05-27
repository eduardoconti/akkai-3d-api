import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsignacaoController } from '@consignacao/controllers';
import {
  Consignacao,
  ItemConsignacao,
  Revendedor,
} from '@consignacao/entities';
import { ConsignacaoService, RevendedorService } from '@consignacao/services';
import {
  AlterarRevendedorUseCase,
  InserirConsignacaoUseCase,
  InserirRevendedorUseCase,
  RegistrarDevolucaoConsignadaUseCase,
  RegistrarVendasConsignadasUseCase,
} from '@consignacao/use-cases';
import { ProdutoModule } from '@produto/produto.module';
import { MovimentacaoEstoque } from '@produto/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consignacao,
      ItemConsignacao,
      Revendedor,
      MovimentacaoEstoque,
    ]),
    ProdutoModule,
  ],
  controllers: [ConsignacaoController],
  providers: [
    RevendedorService,
    ConsignacaoService,
    InserirRevendedorUseCase,
    AlterarRevendedorUseCase,
    InserirConsignacaoUseCase,
    RegistrarVendasConsignadasUseCase,
    RegistrarDevolucaoConsignadaUseCase,
  ],
  exports: [RevendedorService, ConsignacaoService],
})
export class ConsignacaoModule {}
