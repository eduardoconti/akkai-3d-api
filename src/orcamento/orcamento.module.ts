import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentoController } from '@orcamento/controllers';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import {
  AtualizarOrcamentoUseCase,
  InserirOrcamentoUseCase,
} from '@orcamento/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento])],
  controllers: [OrcamentoController],
  providers: [
    OrcamentoService,
    InserirOrcamentoUseCase,
    AtualizarOrcamentoUseCase,
  ],
})
export class OrcamentoModule {}
