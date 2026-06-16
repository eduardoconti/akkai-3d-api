import { BadRequestException } from '@nestjs/common';
import { CanalAtendimentoOrcamento, Orcamento } from '@orcamento/entities';
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
      tipo: 'LOJA' as never,
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

  it('deve criar orçamento online com canal de atendimento', async () => {
    const inserirOrcamento = jest
      .fn()
      .mockResolvedValue(Object.assign(new Orcamento(), { id: 1 }));
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    const useCase = new InserirOrcamentoUseCase(service);

    await useCase.execute({
      nomeCliente: 'Maria',
      tipo: 'ONLINE' as never,
      canalAtendimento: CanalAtendimentoOrcamento.WPP,
    });

    expect(inserirOrcamento).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'ONLINE',
        canalAtendimento: CanalAtendimentoOrcamento.WPP,
      }),
    );
  });

  it('deve exigir canal de atendimento para orçamento online', async () => {
    const inserirOrcamento = jest.fn();
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    const useCase = new InserirOrcamentoUseCase(service);

    await expect(
      useCase.execute({
        nomeCliente: 'Maria',
        tipo: 'ONLINE' as never,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(inserirOrcamento).not.toHaveBeenCalled();
  });
});
