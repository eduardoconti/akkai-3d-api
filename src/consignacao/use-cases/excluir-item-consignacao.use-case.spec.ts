import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ItemConsignacao } from '@consignacao/entities';
import { ConsignacaoService } from '@consignacao/services';
import { TipoMovimentacaoEstoque } from '@produto/entities';
import { ExcluirItemConsignacaoUseCase } from './excluir-item-consignacao.use-case';

describe('ExcluirItemConsignacaoUseCase', () => {
  it('deve excluir item e gerar entrada de estoque', async () => {
    const resposta = { id: 1, itens: [] };
    const item = Object.assign(new ItemConsignacao(), {
      id: 2,
      idProduto: 10,
      quantidadeEnviada: 4,
    });
    const consignacaoService = {
      excluirItem: jest.fn().mockResolvedValue(resposta),
      garantirItemAberto: jest.fn().mockResolvedValue(item),
    };
    const useCase = new ExcluirItemConsignacaoUseCase(
      consignacaoService as unknown as ConsignacaoService,
      { usuarioId: 7 } as CurrentUserContext,
    );

    const resultado = await useCase.execute({
      idConsignacao: 1,
      idItem: 2,
    });

    expect(resultado).toBe(resposta);
    expect(consignacaoService.garantirItemAberto).toHaveBeenCalledWith(1, 2);
    expect(consignacaoService.excluirItem).toHaveBeenCalledWith(
      item,
      expect.objectContaining({
        idProduto: 10,
        quantidade: 4,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        idUsuarioInclusao: 7,
      }),
    );
  });
});
