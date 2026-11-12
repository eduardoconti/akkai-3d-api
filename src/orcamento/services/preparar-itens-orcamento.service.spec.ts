import { NotFoundException } from '@nestjs/common';
import { ConsultaProduto } from '@produto/contracts';
import { PrepararItensOrcamentoService } from '@orcamento/services';

describe('PrepararItensOrcamentoService', () => {
  let service: PrepararItensOrcamentoService;
  let produtoService: { garantirExisteProduto: jest.Mock };

  beforeEach(() => {
    produtoService = { garantirExisteProduto: jest.fn() };
    service = new PrepararItensOrcamentoService(
      produtoService as unknown as ConsultaProduto,
    );
  });

  it('deve guardar o nome atual de cada produto', async () => {
    produtoService.garantirExisteProduto
      .mockResolvedValueOnce({ id: 10, nome: 'Chaveiro' })
      .mockResolvedValueOnce({ id: 11, nome: 'Vaso' });

    const resultado = await service.preparar([
      { idProduto: 10, quantidade: 2 },
      { idProduto: 11, quantidade: 1 },
    ]);

    expect(resultado).toEqual([
      { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 2 },
      { idProduto: 11, nomeProduto: 'Vaso', quantidade: 1 },
    ]);
  });

  it('deve devolver lista vazia sem consultar produtos', async () => {
    expect(await service.preparar([])).toEqual([]);
    expect(produtoService.garantirExisteProduto).not.toHaveBeenCalled();
  });

  it('deve propagar o erro de produto inexistente', async () => {
    produtoService.garantirExisteProduto.mockRejectedValue(
      new NotFoundException('Produto com ID 99 não encontrado'),
    );

    await expect(
      service.preparar([{ idProduto: 99, quantidade: 1 }]),
    ).rejects.toThrow(NotFoundException);
  });
});
