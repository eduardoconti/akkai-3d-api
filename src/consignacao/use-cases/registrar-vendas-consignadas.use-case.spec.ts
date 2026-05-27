import { ConsignacaoService } from '@consignacao/services';
import { RegistrarVendasConsignadasUseCase } from './registrar-vendas-consignadas.use-case';

describe('RegistrarVendasConsignadasUseCase', () => {
  it('deve registrar vendas em lote', async () => {
    const resposta = { id: 1, itens: [] };
    const consignacaoService = {
      registrarVendas: jest.fn().mockResolvedValue(resposta),
    };
    const useCase = new RegistrarVendasConsignadasUseCase(
      consignacaoService as unknown as ConsignacaoService,
    );

    const resultado = await useCase.execute({
      idConsignacao: 1,
      itens: [
        { idProduto: 10, quantidade: 2 },
        { idProduto: 20, quantidade: 1 },
      ],
    });

    expect(resultado).toBe(resposta);
    expect(consignacaoService.registrarVendas).toHaveBeenCalledWith(1, [
      { idProduto: 10, quantidade: 2 },
      { idProduto: 20, quantidade: 1 },
    ]);
  });
});
