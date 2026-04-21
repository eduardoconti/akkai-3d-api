import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoModule } from '@produto/produto.module';
import {
  Assinante,
  CicloAssinatura,
  ItemCicloAssinatura,
  ItemKitMensal,
  KitMensal,
  PlanoAssinatura,
} from '@assinatura/entities';
import {
  AssinanteService,
  CicloService,
  KitMensalService,
  PlanoService,
} from '@assinatura/services';
import {
  AlterarAssinanteUseCase,
  AlterarCicloUseCase,
  AlterarKitMensalUseCase,
  AlterarPlanoUseCase,
  ExcluirAssinanteUseCase,
  ExcluirCicloUseCase,
  ExcluirKitMensalUseCase,
  ExcluirPlanoUseCase,
  GerarCiclosMensaisUseCase,
  InserirAssinanteUseCase,
  InserirCicloUseCase,
  InserirKitMensalUseCase,
  InserirPlanoUseCase,
} from '@assinatura/use-cases';
import { AssinaturaController } from '@assinatura/controllers';

@Module({
  controllers: [AssinaturaController],
  providers: [
    PlanoService,
    AssinanteService,
    CicloService,
    KitMensalService,
    InserirPlanoUseCase,
    AlterarPlanoUseCase,
    ExcluirPlanoUseCase,
    InserirAssinanteUseCase,
    AlterarAssinanteUseCase,
    ExcluirAssinanteUseCase,
    InserirCicloUseCase,
    AlterarCicloUseCase,
    ExcluirCicloUseCase,
    InserirKitMensalUseCase,
    AlterarKitMensalUseCase,
    ExcluirKitMensalUseCase,
    GerarCiclosMensaisUseCase,
  ],
  imports: [
    ProdutoModule,
    TypeOrmModule.forFeature([
      PlanoAssinatura,
      Assinante,
      CicloAssinatura,
      ItemCicloAssinatura,
      KitMensal,
      ItemKitMensal,
    ]),
  ],
})
export class AssinaturaModule {}
