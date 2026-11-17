import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';
import { EstoqueNegativoProvedor } from './estoque-negativo.provedor';

describe('EstoqueNegativoProvedor', () => {
  const consultaEstoque = { listarComEstoqueNegativo: jest.fn() };
  let provedor: EstoqueNegativoProvedor;

  beforeEach(() => {
    jest.clearAllMocks();
    provedor = new EstoqueNegativoProvedor(consultaEstoque);
  });

  it('exige a permissão de leitura de produtos', () => {
    expect(provedor.tipo).toBe(TipoAlerta.ESTOQUE_NEGATIVO);
    expect(provedor.permissao).toBe('produto.ler');
  });

  it('não gera alerta quando nenhum produto está negativo', async () => {
    consultaEstoque.listarComEstoqueNegativo.mockResolvedValueOnce({
      total: 0,
      itens: [],
    });

    await expect(provedor.obter()).resolves.toBeNull();
    expect(consultaEstoque.listarComEstoqueNegativo).toHaveBeenCalledWith(5);
  });

  it('gera alerta crítico com código e saldo dos produtos', async () => {
    consultaEstoque.listarComEstoqueNegativo.mockResolvedValueOnce({
      total: 1,
      itens: [{ id: 5, codigo: 101, nome: 'Dragão', quantidadeEstoque: -3 }],
    });

    await expect(provedor.obter()).resolves.toEqual({
      tipo: TipoAlerta.ESTOQUE_NEGATIVO,
      severidade: SeveridadeAlerta.CRITICO,
      titulo: '1 produto com estoque negativo',
      descricao:
        'Vendas maiores que o saldo. Registre a entrada ou corrija o estoque.',
      quantidade: 1,
      chave: 'ESTOQUE_NEGATIVO:1:5',
      itens: [{ id: 5, titulo: 'Dragão', detalhe: 'Código 101 · saldo -3' }],
    });
  });
});
