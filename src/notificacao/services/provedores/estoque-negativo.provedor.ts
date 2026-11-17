import { Injectable } from '@nestjs/common';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { ConsultaEstoqueNegativo } from '@produto/contracts';
import {
  Alerta,
  LIMITE_ITENS_ALERTA,
  montarChaveAlerta,
  pluralizar,
  ProvedorAlerta,
} from '@notificacao/contracts';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';

@Injectable()
export class EstoqueNegativoProvedor extends ProvedorAlerta {
  readonly tipo = TipoAlerta.ESTOQUE_NEGATIVO;
  readonly permissao = PERMISSOES.PRODUTO.LER;

  constructor(private readonly consultaEstoque: ConsultaEstoqueNegativo) {
    super();
  }

  async obter(): Promise<Alerta | null> {
    const { total, itens } =
      await this.consultaEstoque.listarComEstoqueNegativo(LIMITE_ITENS_ALERTA);

    if (total === 0) {
      return null;
    }

    return {
      tipo: this.tipo,
      severidade: SeveridadeAlerta.CRITICO,
      titulo: pluralizar(
        total,
        'produto com estoque negativo',
        'produtos com estoque negativo',
      ),
      descricao:
        'Vendas maiores que o saldo. Registre a entrada ou corrija o estoque.',
      quantidade: total,
      chave: montarChaveAlerta(
        this.tipo,
        total,
        itens.map((item) => item.id),
      ),
      itens: itens.map((item) => ({
        id: item.id,
        titulo: item.nome,
        detalhe: `Código ${item.codigo} · saldo ${item.quantidadeEstoque}`,
      })),
    };
  }
}
