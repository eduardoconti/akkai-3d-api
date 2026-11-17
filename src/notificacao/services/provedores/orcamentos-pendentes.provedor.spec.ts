import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';
import { OrcamentosPendentesProvedor } from './orcamentos-pendentes.provedor';

describe('OrcamentosPendentesProvedor', () => {
  const consultaOrcamentos = { listarPendentes: jest.fn() };
  let provedor: OrcamentosPendentesProvedor;

  beforeEach(() => {
    jest.clearAllMocks();
    provedor = new OrcamentosPendentesProvedor(consultaOrcamentos);
  });

  it('exige a permissão de leitura de orçamentos', () => {
    expect(provedor.tipo).toBe(TipoAlerta.ORCAMENTO_PENDENTE);
    expect(provedor.permissao).toBe('orcamento.ler');
  });

  it('não gera alerta quando não há orçamentos pendentes', async () => {
    consultaOrcamentos.listarPendentes.mockResolvedValueOnce({
      total: 0,
      itens: [],
    });

    await expect(provedor.obter()).resolves.toBeNull();
    expect(consultaOrcamentos.listarPendentes).toHaveBeenCalledWith(5);
  });

  it('gera alerta de aviso com os orçamentos mais antigos', async () => {
    consultaOrcamentos.listarPendentes.mockResolvedValueOnce({
      total: 7,
      itens: [
        {
          id: 12,
          nomeCliente: 'Maria',
          dataInclusao: new Date('2026-11-01T10:00:00.000Z'),
        },
        {
          id: 3,
          nomeCliente: 'João',
          dataInclusao: new Date('2026-11-02T10:00:00.000Z'),
        },
      ],
    });

    await expect(provedor.obter()).resolves.toEqual({
      tipo: TipoAlerta.ORCAMENTO_PENDENTE,
      severidade: SeveridadeAlerta.AVISO,
      titulo: '7 orçamentos pendentes',
      descricao: 'Aguardando andamento, do mais antigo para o mais novo.',
      quantidade: 7,
      chave: 'ORCAMENTO_PENDENTE:7:3,12',
      itens: [
        {
          id: 12,
          titulo: 'Maria',
          detalhe: 'Orçamento #12',
          data: '2026-11-01T10:00:00.000Z',
        },
        {
          id: 3,
          titulo: 'João',
          detalhe: 'Orçamento #3',
          data: '2026-11-02T10:00:00.000Z',
        },
      ],
    });
  });

  it('usa o singular quando há um orçamento pendente', async () => {
    consultaOrcamentos.listarPendentes.mockResolvedValueOnce({
      total: 1,
      itens: [
        {
          id: 1,
          nomeCliente: 'Ana',
          dataInclusao: new Date('2026-11-01T10:00:00.000Z'),
        },
      ],
    });

    const alerta = await provedor.obter();

    expect(alerta?.titulo).toBe('1 orçamento pendente');
  });
});
