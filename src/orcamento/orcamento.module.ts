import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentoController } from '@orcamento/controllers';
import { ItemOrcamento, Orcamento } from '@orcamento/entities';
import { ProdutoModule } from '@produto/produto.module';
import {
  OrcamentoService,
  PrepararItensOrcamentoService,
} from '@orcamento/services';
import {
  AtualizarOrcamentoUseCase,
  InserirOrcamentoUseCase,
} from '@orcamento/use-cases';
import { FinalizacaoOrcamento } from '@orcamento/contracts';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orcamento, ItemOrcamento]),
    ProdutoModule,
  ],
  controllers: [OrcamentoController],
  providers: [
    OrcamentoService,
    PrepararItensOrcamentoService,
    { provide: FinalizacaoOrcamento, useExisting: OrcamentoService },
    InserirOrcamentoUseCase,
    AtualizarOrcamentoUseCase,
  ],
  exports: [FinalizacaoOrcamento],
})
export class OrcamentoModule {}
