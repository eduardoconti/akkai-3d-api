import { Module } from '@nestjs/common';
import { FinanceiroModule } from '@financeiro/financeiro.module';
import { OrcamentoModule } from '@orcamento/orcamento.module';
import { ProdutoModule } from '@produto/produto.module';
import { NotificacaoController } from '@notificacao/controllers';
import { PROVEDORES_ALERTA, ProvedorAlerta } from '@notificacao/contracts';
import {
  CaixasAbertosProvedor,
  EstoqueNegativoProvedor,
  OrcamentosPendentesProvedor,
} from '@notificacao/services';
import { ConsultarAlertasUseCase } from '@notificacao/use-cases';

const PROVEDORES = [
  CaixasAbertosProvedor,
  EstoqueNegativoProvedor,
  OrcamentosPendentesProvedor,
];

@Module({
  imports: [FinanceiroModule, OrcamentoModule, ProdutoModule],
  controllers: [NotificacaoController],
  providers: [
    ...PROVEDORES,
    {
      provide: PROVEDORES_ALERTA,
      useFactory: (...provedores: ProvedorAlerta[]) => provedores,
      inject: PROVEDORES,
    },
    ConsultarAlertasUseCase,
  ],
})
export class NotificacaoModule {}
