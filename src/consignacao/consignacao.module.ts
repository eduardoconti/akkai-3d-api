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
  AdicionarItemConsignacaoUseCase,
  AlterarItemConsignacaoUseCase,
  AlterarRevendedorUseCase,
  ExcluirItemConsignacaoUseCase,
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
    AdicionarItemConsignacaoUseCase,
    AlterarItemConsignacaoUseCase,
    ExcluirItemConsignacaoUseCase,
    RegistrarVendasRevendedorConsignadoUseCase,
    RegistrarDevolucaoConsignadaUseCase,
  ],
})
export class ConsignacaoModule {}
