import { Inject, Injectable, Logger } from '@nestjs/common';
import { ContextoUsuario } from '@common/contracts';
import {
  Alerta,
  PROVEDORES_ALERTA,
  ProvedorAlerta,
} from '@notificacao/contracts';
import { SeveridadeAlerta } from '@notificacao/enums';

const ORDEM_SEVERIDADE: Record<SeveridadeAlerta, number> = {
  [SeveridadeAlerta.CRITICO]: 0,
  [SeveridadeAlerta.AVISO]: 1,
};

@Injectable()
export class ConsultarAlertasUseCase {
  private readonly logger = new Logger(ConsultarAlertasUseCase.name);

  constructor(
    @Inject(PROVEDORES_ALERTA)
    private readonly provedores: ProvedorAlerta[],
    private readonly contextoUsuario: ContextoUsuario,
  ) {}

  /**
   * Calcula os alertas que o usuário pode ver. Um provedor com erro é
   * registrado no log e ignorado, sem impedir os demais.
   */
  async executar(): Promise<Alerta[]> {
    const permissoes = new Set(this.contextoUsuario.permissoes);
    const permitidos = this.provedores.filter((provedor) =>
      permissoes.has(provedor.permissao),
    );
    const resultados = await Promise.allSettled(
      permitidos.map((provedor) => provedor.obter()),
    );
    const alertas: Alerta[] = [];

    resultados.forEach((resultado, indice) => {
      if (resultado.status === 'rejected') {
        this.logger.error(
          `Erro ao calcular o alerta ${permitidos[indice]?.tipo}`,
          resultado.reason,
        );
        return;
      }

      if (resultado.value) {
        alertas.push(resultado.value);
      }
    });

    return alertas.sort(
      (a, b) => ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade],
    );
  }
}
