import { BadRequestException } from '@nestjs/common';
import { CanalAtendimentoOrcamento, Orcamento } from '@orcamento/entities';
import {
  OrcamentoService,
  PrepararItensOrcamentoService,
} from '@orcamento/services';
import { InserirOrcamentoUseCase } from '@orcamento/use-cases';

describe('InserirOrcamentoUseCase', () => {
  const preparar = jest.fn();
  const prepararItens = {
    preparar,
  } as unknown as PrepararItensOrcamentoService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar orçamento com os dados informados', async () => {
    const inserirOrcamento = jest
      .fn()
      .mockResolvedValue(Object.assign(new Orcamento(), { id: 1 }));
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    const useCase = new InserirOrcamentoUseCase(service, prepararItens);

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
    const useCase = new InserirOrcamentoUseCase(service, prepararItens);

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
    const useCase = new InserirOrcamentoUseCase(service, prepararItens);

    await expect(
      useCase.execute({
        nomeCliente: 'Maria',
        tipo: 'ONLINE' as never,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(inserirOrcamento).not.toHaveBeenCalled();
  });

  it('deve criar orçamento com os produtos do catálogo', async () => {
    const inserirOrcamento = jest
      .fn()
      .mockResolvedValue(Object.assign(new Orcamento(), { id: 1 }));
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    preparar.mockResolvedValue([
      { idProduto: 10, nomeProduto: 'Chaveiro', quantidade: 2 },
    ]);
    const useCase = new InserirOrcamentoUseCase(service, prepararItens);

    await useCase.execute({
      nomeCliente: 'Eduardo',
      tipo: 'LOJA' as never,
      itens: [{ idProduto: 10, quantidade: 2 }],
    });

    expect(preparar).toHaveBeenCalledWith([{ idProduto: 10, quantidade: 2 }]);
    expect(inserirOrcamento).toHaveBeenCalledWith(
      expect.objectContaining({
        itens: [expect.objectContaining({ idProduto: 10, quantidade: 2 })],
      }),
    );
  });

  it('não deve consultar produtos quando não há itens', async () => {
    const inserirOrcamento = jest
      .fn()
      .mockResolvedValue(Object.assign(new Orcamento(), { id: 1 }));
    const service = { inserirOrcamento } as unknown as OrcamentoService;
    const useCase = new InserirOrcamentoUseCase(service, prepararItens);

    await useCase.execute({
      nomeCliente: 'Eduardo',
      tipo: 'LOJA' as never,
      itens: [],
    });

    expect(preparar).not.toHaveBeenCalled();
    expect(inserirOrcamento).toHaveBeenCalledWith(
      expect.objectContaining({ itens: undefined }),
    );
  });
});
