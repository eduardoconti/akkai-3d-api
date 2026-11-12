import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InserirOrcamentoDto } from './inserir-orcamento.dto';
import { AtualizarOrcamentoDto } from './atualizar-orcamento.dto';
import { MAXIMO_ITENS_ORCAMENTO } from './item-orcamento.dto';

const base = { nomeCliente: 'Eduardo', tipo: 'LOJA' };

async function erroDe(
  classe: typeof InserirOrcamentoDto | typeof AtualizarOrcamentoDto,
  dados: object,
) {
  const dto = plainToInstance(classe, dados);
  const erros = await validate(dto, { whitelist: true });

  return erros.find((erro) => erro.property === 'itens');
}

describe.each([
  ['InserirOrcamentoDto', InserirOrcamentoDto, base],
  ['AtualizarOrcamentoDto', AtualizarOrcamentoDto, {}],
])('itens de %s', (_nome, classe, dadosBase) => {
  it('deve aceitar produtos válidos, lista vazia e ausência de itens', async () => {
    for (const itens of [[{ idProduto: 10, quantidade: 2 }], [], undefined]) {
      expect(await erroDe(classe, { ...dadosBase, itens })).toBeUndefined();
    }
  });

  it('deve converter ids e quantidades recebidos como texto', () => {
    const dto = plainToInstance(classe, {
      ...dadosBase,
      itens: [{ idProduto: '10', quantidade: '2' }],
    });

    expect(dto.itens?.[0]).toEqual({ idProduto: 10, quantidade: 2 });
  });

  it('deve rejeitar produto repetido', async () => {
    const erro = await erroDe(classe, {
      ...dadosBase,
      itens: [
        { idProduto: 10, quantidade: 1 },
        { idProduto: 10, quantidade: 2 },
      ],
    });

    expect(erro?.constraints?.['arrayUnique']).toBe(
      'O mesmo produto não pode ser informado mais de uma vez.',
    );
  });

  it('deve rejeitar mais produtos que o limite de uma venda', async () => {
    const itens = Array.from(
      { length: MAXIMO_ITENS_ORCAMENTO + 1 },
      (_, i) => ({
        idProduto: i + 1,
        quantidade: 1,
      }),
    );

    const erro = await erroDe(classe, { ...dadosBase, itens });

    expect(erro?.constraints?.['arrayMaxSize']).toContain('no máximo 12');
  });

  it.each([
    [{ idProduto: 0, quantidade: 1 }, 'idProduto'],
    [{ idProduto: 10, quantidade: 0 }, 'quantidade'],
    [{ idProduto: 10, quantidade: 501 }, 'quantidade'],
    [{ idProduto: 10, quantidade: 1.5 }, 'quantidade'],
  ])('deve rejeitar item inválido %j', async (item, campo) => {
    const erro = await erroDe(classe, { ...dadosBase, itens: [item] });
    const filho = erro?.children?.[0]?.children?.find(
      (c) => c.property === campo,
    );

    expect(filho).toBeDefined();
  });

  it('deve rejeitar itens que não sejam uma lista', async () => {
    const erro = await erroDe(classe, { ...dadosBase, itens: 'abc' });

    expect(erro?.constraints?.['isArray']).toBeDefined();
  });
});
