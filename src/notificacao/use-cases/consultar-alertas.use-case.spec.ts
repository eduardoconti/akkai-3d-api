import { Logger } from '@nestjs/common';
import { Alerta, ProvedorAlerta } from '@notificacao/contracts';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';
import { ConsultarAlertasUseCase } from './consultar-alertas.use-case';

function alerta(tipo: TipoAlerta, severidade: SeveridadeAlerta): Alerta {
  return {
    tipo,
    severidade,
    titulo: tipo,
    descricao: '',
    quantidade: 1,
    chave: `${tipo}:1:1`,
    itens: [],
  };
}

function provedor(
  tipo: TipoAlerta,
  permissao: string,
  obter: jest.Mock,
): ProvedorAlerta {
  return { tipo, permissao, obter };
}

describe('ConsultarAlertasUseCase', () => {
  const orcamentos = jest.fn();
  const caixas = jest.fn();
  const estoque = jest.fn();
  const provedores = [
    provedor(TipoAlerta.ORCAMENTO_PENDENTE, 'orcamento.ler', orcamentos),
    provedor(TipoAlerta.CAIXA_ABERTO_PROLONGADO, 'caixa.ler', caixas),
    provedor(TipoAlerta.ESTOQUE_NEGATIVO, 'produto.ler', estoque),
  ];

  function criar(permissoes: string[]) {
    return new ConsultarAlertasUseCase(provedores, {
      usuarioId: 1,
      permissoes,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    orcamentos.mockResolvedValue(
      alerta(TipoAlerta.ORCAMENTO_PENDENTE, SeveridadeAlerta.AVISO),
    );
    caixas.mockResolvedValue(
      alerta(TipoAlerta.CAIXA_ABERTO_PROLONGADO, SeveridadeAlerta.CRITICO),
    );
    estoque.mockResolvedValue(null);
  });

  it('consulta só os alertas que o usuário tem permissão de ver', async () => {
    const alertas = await criar(['orcamento.ler']).executar();

    expect(alertas.map((item) => item.tipo)).toEqual([
      TipoAlerta.ORCAMENTO_PENDENTE,
    ]);
    expect(caixas).not.toHaveBeenCalled();
    expect(estoque).not.toHaveBeenCalled();
  });

  it('ordena críticos antes de avisos e omite provedores sem alerta', async () => {
    const alertas = await criar([
      'orcamento.ler',
      'caixa.ler',
      'produto.ler',
    ]).executar();

    expect(alertas.map((item) => item.tipo)).toEqual([
      TipoAlerta.CAIXA_ABERTO_PROLONGADO,
      TipoAlerta.ORCAMENTO_PENDENTE,
    ]);
    expect(estoque).toHaveBeenCalledTimes(1);
  });

  it('ignora um provedor com erro sem derrubar os demais', async () => {
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    caixas.mockRejectedValueOnce(new Error('falha no banco'));

    const alertas = await criar(['orcamento.ler', 'caixa.ler']).executar();

    expect(alertas.map((item) => item.tipo)).toEqual([
      TipoAlerta.ORCAMENTO_PENDENTE,
    ]);
    expect(logError).toHaveBeenCalledWith(
      'Erro ao calcular o alerta CAIXA_ABERTO_PROLONGADO',
      expect.any(Error),
    );
    logError.mockRestore();
  });

  it('devolve lista vazia para usuário sem permissões', async () => {
    await expect(criar([]).executar()).resolves.toEqual([]);
  });
});
