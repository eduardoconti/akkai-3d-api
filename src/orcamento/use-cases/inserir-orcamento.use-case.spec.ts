import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { InserirOrcamentoUseCase } from '@orcamento/use-cases';

describe('InserirOrcamentoUseCase', () => {
  it('deve criar orçamento com os dados informados', async () => {
    const inserirOrcamento = jest
      .fn()
      .mockResolvedValue(Object.assign(new Orcamento(), { id: 1 }));
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    const useCase = new InserirOrcamentoUseCase(service);

    await useCase.execute({
      nomeCliente: 'Eduardo',
      telefoneCliente: '21999999999',
      descricao: 'Peça decorativa',
      linkSTL: 'https://exemplo.com/modelo.stl',
    });

    expect(inserirOrcamento).toHaveBeenCalledWith(
      expect.objectContaining({
        nomeCliente: 'Eduardo',
        telefoneCliente: '21999999999',
        descricao: 'Peça decorativa',
        linkSTL: 'https://exemplo.com/modelo.stl',
      }),
    );
  });
});
