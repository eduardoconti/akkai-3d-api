import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { ConsultaCaixasAbertos } from '@financeiro/contracts';
import {
  Alerta,
  LIMITE_ITENS_ALERTA,
  montarChaveAlerta,
  pluralizar,
  ProvedorAlerta,
} from '@notificacao/contracts';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';

@Injectable()
export class CaixasAbertosProvedor extends ProvedorAlerta {
  readonly tipo = TipoAlerta.CAIXA_ABERTO_PROLONGADO;
  readonly permissao = PERMISSOES.FINANCEIRO.CAIXA.LER;
  private readonly limiteHoras: number;

  constructor(
    private readonly consultaCaixas: ConsultaCaixasAbertos,
    configService: ConfigService,
  ) {
    super();
    this.limiteHoras = configService.getOrThrow<number>(
      'ALERTA_CAIXA_ABERTO_HORAS',
    );
  }

  async obter(): Promise<Alerta | null> {
    const { total, itens } = await this.consultaCaixas.listarAbertosHaMaisDe(
      this.limiteHoras,
      LIMITE_ITENS_ALERTA,
    );

    if (total === 0) {
      return null;
    }

    return {
      tipo: this.tipo,
      severidade: SeveridadeAlerta.CRITICO,
      titulo: `${pluralizar(total, 'caixa aberto', 'caixas abertos')} há mais de ${this.limiteHoras}h`,
      descricao: 'Feche o caixa ao fim da feira para conferir os valores.',
      quantidade: total,
      chave: montarChaveAlerta(
        this.tipo,
        total,
        itens.map((item) => item.id),
      ),
      itens: itens.map((item) => ({
        id: item.id,
        titulo: item.nomeFeira ?? `Feira #${item.idFeira}`,
        detalhe: `Caixa #${item.id}`,
        data: item.dataAbertura.toISOString(),
      })),
    };
  }
}
