import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';
import { CaixasAbertosProvedor } from './caixas-abertos.provedor';

describe('CaixasAbertosProvedor', () => {
  const consultaCaixas = { listarAbertosHaMaisDe: jest.fn() };
  const configService = { getOrThrow: jest.fn(() => 24) };
  let provedor: CaixasAbertosProvedor;

  beforeEach(() => {
    jest.clearAllMocks();
    provedor = new CaixasAbertosProvedor(
      consultaCaixas,
      configService as never,
    );
  });

  it('lê o limite de horas da configuração e exige leitura de caixa', () => {
    expect(configService.getOrThrow).toHaveBeenCalledWith(
      'ALERTA_CAIXA_ABERTO_HORAS',
    );
    expect(provedor.tipo).toBe(TipoAlerta.CAIXA_ABERTO_PROLONGADO);
    expect(provedor.permissao).toBe('caixa.ler');
  });

  it('busca caixas abertos há mais que o limite de horas', async () => {
    consultaCaixas.listarAbertosHaMaisDe.mockResolvedValueOnce({
      total: 0,
      itens: [],
    });

    await expect(provedor.obter()).resolves.toBeNull();
    expect(consultaCaixas.listarAbertosHaMaisDe).toHaveBeenCalledWith(24, 5);
  });

  it('gera alerta crítico com a feira e a data de abertura', async () => {
    consultaCaixas.listarAbertosHaMaisDe.mockResolvedValueOnce({
      total: 2,
      itens: [
        {
          id: 8,
          idFeira: 1,
          nomeFeira: 'Feira do Centro',
          dataAbertura: new Date('2026-11-14T09:00:00.000Z'),
        },
        {
          id: 9,
          idFeira: 4,
          dataAbertura: new Date('2026-11-15T09:00:00.000Z'),
        },
      ],
    });

    await expect(provedor.obter()).resolves.toEqual({
      tipo: TipoAlerta.CAIXA_ABERTO_PROLONGADO,
      severidade: SeveridadeAlerta.CRITICO,
      titulo: '2 caixas abertos há mais de 24h',
      descricao: 'Feche o caixa ao fim da feira para conferir os valores.',
      quantidade: 2,
      chave: 'CAIXA_ABERTO_PROLONGADO:2:8,9',
      itens: [
        {
          id: 8,
          titulo: 'Feira do Centro',
          detalhe: 'Caixa #8',
          data: '2026-11-14T09:00:00.000Z',
        },
        {
          id: 9,
          titulo: 'Feira #4',
          detalhe: 'Caixa #9',
          data: '2026-11-15T09:00:00.000Z',
        },
      ],
    });
  });
});
