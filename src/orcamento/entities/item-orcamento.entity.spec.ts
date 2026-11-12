import { getMetadataArgsStorage } from 'typeorm';
import { ItemOrcamento } from '@orcamento/entities';

describe('ItemOrcamento', () => {
  it('deve criar o item com produto, nome e quantidade', () => {
    const item = ItemOrcamento.criar({
      idProduto: 10,
      nomeProduto: 'Chaveiro',
      quantidade: 3,
    });

    expect(item).toBeInstanceOf(ItemOrcamento);
    expect(item).toMatchObject({
      idProduto: 10,
      nomeProduto: 'Chaveiro',
      quantidade: 3,
    });
  });

  it('deve declarar os índices e a unicidade por produto', () => {
    const { indices, uniques } = getMetadataArgsStorage();

    expect(
      indices.find(
        (indice) =>
          indice.target === ItemOrcamento &&
          indice.name === 'idx_item_orcamento_id_orcamento',
      )?.columns,
    ).toEqual(['idOrcamento']);
    expect(
      uniques.find(
        (unico) =>
          unico.target === ItemOrcamento &&
          unico.name === 'uk_item_orcamento_orcamento_produto',
      )?.columns,
    ).toEqual(['idOrcamento', 'idProduto']);
  });
});
