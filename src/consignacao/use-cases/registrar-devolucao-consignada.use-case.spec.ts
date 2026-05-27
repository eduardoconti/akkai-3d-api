import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsignacaoService } from '@consignacao/services';
import { RegistrarDevolucaoConsignadaUseCase } from './registrar-devolucao-consignada.use-case';

describe('RegistrarDevolucaoConsignadaUseCase', () => {
  it('deve registrar devolução com usuário autenticado', async () => {
    const resposta = { id: 1, itens: [] };
    const consignacaoService = {
      registrarDevolucao: jest.fn().mockResolvedValue(resposta),
    };
    const useCase = new RegistrarDevolucaoConsignadaUseCase(
      consignacaoService as unknown as ConsignacaoService,
      { usuarioId: 8 } as CurrentUserContext,
    );

    const resultado = await useCase.execute({
      idConsignacao: 1,
      idItem: 2,
      quantidade: 3,
    });

    expect(resultado).toBe(resposta);
    expect(consignacaoService.registrarDevolucao).toHaveBeenCalledWith(
      1,
      2,
      3,
      8,
    );
  });
});
