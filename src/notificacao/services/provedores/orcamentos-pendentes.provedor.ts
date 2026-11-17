import { Injectable } from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { ConsultaOrcamentosPendentes } from '@orcamento/contracts';
import {
  Alerta,
  LIMITE_ITENS_ALERTA,
  montarChaveAlerta,
  pluralizar,
  ProvedorAlerta,
} from '@notificacao/contracts';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';

@Injectable()
export class OrcamentosPendentesProvedor extends ProvedorAlerta {
  readonly tipo = TipoAlerta.ORCAMENTO_PENDENTE;
  readonly permissao = PERMISSOES.ORCAMENTO.LER;

  constructor(
    private readonly consultaOrcamentos: ConsultaOrcamentosPendentes,
  ) {
    super();
  }

  async obter(): Promise<Alerta | null> {
    const { total, itens } =
      await this.consultaOrcamentos.listarPendentes(LIMITE_ITENS_ALERTA);

    if (total === 0) {
      return null;
    }

    return {
      tipo: this.tipo,
      severidade: SeveridadeAlerta.AVISO,
      titulo: pluralizar(total, 'orçamento pendente', 'orçamentos pendentes'),
      descricao: 'Aguardando andamento, do mais antigo para o mais novo.',
      quantidade: total,
      chave: montarChaveAlerta(
        this.tipo,
        total,
        itens.map((item) => item.id),
      ),
      itens: itens.map((item) => ({
        id: item.id,
        titulo: item.nomeCliente,
        detalhe: `Orçamento #${item.id}`,
        data: item.dataInclusao.toISOString(),
      })),
    };
  }
}
