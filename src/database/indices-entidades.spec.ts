import { getMetadataArgsStorage } from 'typeorm';
import { KitMensal } from '@assinatura/entities';
import { Caixa } from '@financeiro/entities';
import { MovimentacaoEstoque } from '@produto/entities';
import { Venda } from '@venda/entities';

describe('Índices declarados nas entidades', () => {
  const obterIndice = (entidade: object, nome: string) =>
    getMetadataArgsStorage().indices.find(
      (indice) => indice.target === entidade && indice.name === nome,
    );

  it('deve declarar o unique parcial de caixa aberto por feira', () => {
    const indice = obterIndice(Caixa, 'uk_caixa_aberto_feira');

    expect(indice?.unique).toBe(true);
    expect(indice?.columns).toEqual(['idFeira']);
    expect(indice?.where).toBe(`"status" = 'ABERTO'`);
  });

  it('deve declarar os índices criados apenas em migrations', () => {
    expect(obterIndice(Venda, 'idx_venda_id_consignacao')?.columns).toEqual([
      'idConsignacao',
    ]);
    expect(obterIndice(KitMensal, 'idx_kit_mensal_ativo')?.columns).toEqual([
      'ativo',
    ]);
  });

  it('deve declarar os índices de data da movimentação de estoque', () => {
    expect(
      obterIndice(MovimentacaoEstoque, 'idx_movimentacao_estoque_data_inclusao')
        ?.columns,
    ).toEqual(['dataInclusao', 'id']);
    expect(
      obterIndice(
        MovimentacaoEstoque,
        'idx_movimentacao_estoque_origem_tipo_data_inclusao',
      )?.columns,
    ).toEqual(['origem', 'tipo', 'dataInclusao']);
  });
});
