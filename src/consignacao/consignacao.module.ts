import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsignacaoController } from '@consignacao/controllers';
import {
  Consignacao,
  ItemConsignacao,
  Revendedor,
} from '@consignacao/entities';
import {
  ConsignacaoPdfService,
  ConsignacaoService,
  RevendedorService,
} from '@consignacao/services';
import {
  AlterarRevendedorUseCase,
  InserirConsignacaoUseCase,
  InserirRevendedorUseCase,
  RegistrarDevolucaoConsignadaUseCase,
  RegistrarVendasRevendedorConsignadoUseCase,
} from '@consignacao/use-cases';
import { ProdutoModule } from '@produto/produto.module';
import { MovimentacaoEstoque } from '@produto/entities';
import { FinanceiroModule } from '@financeiro/financeiro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consignacao,
      ItemConsignacao,
      Revendedor,
      MovimentacaoEstoque,
    ]),
    ProdutoModule,
    FinanceiroModule,
  ],
  controllers: [ConsignacaoController],
  providers: [
    RevendedorService,
    ConsignacaoService,
    ConsignacaoPdfService,
    InserirRevendedorUseCase,
    AlterarRevendedorUseCase,
    InserirConsignacaoUseCase,
    RegistrarVendasRevendedorConsignadoUseCase,
    RegistrarDevolucaoConsignadaUseCase,
  ],
  exports: [RevendedorService, ConsignacaoService],
})
export class ConsignacaoModule {}
