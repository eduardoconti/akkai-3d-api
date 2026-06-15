import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsignacaoService } from '@consignacao/services';
import {
  MovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { AdicionarItemConsignacaoUseCase } from './adicionar-item-consignacao.use-case';

describe('AdicionarItemConsignacaoUseCase', () => {
  let consignacaoService: { adicionarItem: jest.Mock };
  let produtoService: { garantirExisteProduto: jest.Mock };
  let useCase: AdicionarItemConsignacaoUseCase;

  beforeEach(() => {
    consignacaoService = { adicionarItem: jest.fn() };
    produtoService = { garantirExisteProduto: jest.fn() };
    useCase = new AdicionarItemConsignacaoUseCase(
      consignacaoService as unknown as ConsignacaoService,
      produtoService as unknown as ProdutoService,
      { usuarioId: 7 } as CurrentUserContext,
    );
  });

  it('deve adicionar item e gerar saída de estoque', async () => {
    const resposta = { id: 1, itens: [] };
    produtoService.garantirExisteProduto.mockResolvedValue({
      id: 10,
      nome: 'Dragão',
      valor: 2500,
    });
    consignacaoService.adicionarItem.mockResolvedValue(resposta);

    const resultado = await useCase.execute({
      idConsignacao: 1,
      item: { idProduto: 10, quantidade: 3 },
    });

    expect(resultado).toBe(resposta);
    const [, item, movimentacao] = consignacaoService.adicionarItem.mock
      .calls[0] as [number, unknown, MovimentacaoEstoque];
    expect(item).toMatchObject({
      idProduto: 10,
      quantidadeEnviada: 3,
      valorUnitario: 2500,
    });
    expect(movimentacao).toMatchObject({
      idProduto: 10,
      quantidade: 3,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      idUsuarioInclusao: 7,
    });
  });

  it('deve adicionar item sem consultar detalhe de estoque', async () => {
    const resposta = { id: 1, itens: [] };
    produtoService.garantirExisteProduto.mockResolvedValue({
      id: 10,
      nome: 'Dragão',
      valor: 2500,
    });
    consignacaoService.adicionarItem.mockResolvedValue(resposta);

    const resultado = await useCase.execute({
      idConsignacao: 1,
      item: { idProduto: 10, quantidade: 3 },
    });

    expect(resultado).toBe(resposta);
    expect(consignacaoService.adicionarItem).toHaveBeenCalledTimes(1);
  });
});
