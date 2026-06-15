import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ItemConsignacao } from '@consignacao/entities';
import { ConsignacaoService } from '@consignacao/services';
import { TipoMovimentacaoEstoque } from '@produto/entities';
import { AlterarItemConsignacaoUseCase } from './alterar-item-consignacao.use-case';

describe('AlterarItemConsignacaoUseCase', () => {
  let consignacaoService: {
    alterarItem: jest.Mock;
    garantirItemAberto: jest.Mock;
  };
  let useCase: AlterarItemConsignacaoUseCase;

  beforeEach(() => {
    consignacaoService = {
      alterarItem: jest.fn(),
      garantirItemAberto: jest.fn(),
    };
    useCase = new AlterarItemConsignacaoUseCase(
      consignacaoService as unknown as ConsignacaoService,
      { usuarioId: 7 } as CurrentUserContext,
    );
  });

  it('deve gerar saída de estoque ao aumentar quantidade enviada', async () => {
    const item = Object.assign(new ItemConsignacao(), {
      id: 2,
      idConsignacao: 1,
      idProduto: 10,
      quantidadeEnviada: 3,
      quantidadeVendida: 0,
      quantidadeDevolvida: 0,
      valorUnitario: 2500,
    });
    const resposta = { id: 1, itens: [] };
    consignacaoService.garantirItemAberto.mockResolvedValue(item);
    consignacaoService.alterarItem.mockResolvedValue(resposta);

    const resultado = await useCase.execute({
      idConsignacao: 1,
      idItem: 2,
      item: { quantidade: 5, valorUnitario: 2300 },
    });

    expect(resultado).toBe(resposta);
    const [, quantidade, valorUnitario, movimentacao] = consignacaoService
      .alterarItem.mock.calls[0] as [
      ItemConsignacao,
      number,
      number,
      { tipo: TipoMovimentacaoEstoque; quantidade: number },
    ];
    expect(quantidade).toBe(5);
    expect(valorUnitario).toBe(2300);
    expect(movimentacao).toMatchObject({
      quantidade: 2,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      idUsuarioInclusao: 7,
    });
  });

  it('deve aumentar quantidade enviada sem validar estoque disponível', async () => {
    const resposta = { id: 1, itens: [] };
    consignacaoService.garantirItemAberto.mockResolvedValue(
      Object.assign(new ItemConsignacao(), {
        idProduto: 10,
        quantidadeEnviada: 3,
        valorUnitario: 2500,
      }),
    );
    consignacaoService.alterarItem.mockResolvedValue(resposta);

    const resultado = await useCase.execute({
      idConsignacao: 1,
      idItem: 2,
      item: { quantidade: 5 },
    });

    expect(resultado).toBe(resposta);
    expect(consignacaoService.alterarItem).toHaveBeenCalledTimes(1);
  });
});
