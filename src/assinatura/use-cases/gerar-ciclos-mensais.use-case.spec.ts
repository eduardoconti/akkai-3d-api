import { Assinante, KitMensal, StatusAssinante } from '@assinatura/entities';
import { AssinanteService, CicloService, KitMensalService } from '@assinatura/services';
import { InserirCiclosEmLoteResult } from '@assinatura/services';
import { GerarCiclosMensaisUseCase } from '@assinatura/use-cases';

describe('GerarCiclosMensaisUseCase', () => {
  let useCase: GerarCiclosMensaisUseCase;
  let garantirKitPorIdMock: jest.MockedFunction<(id: number) => Promise<KitMensal>>;
  let listarAssinantesPorPlanoMock: jest.MockedFunction<(idPlano: number) => Promise<Assinante[]>>;
  let inserirCiclosEmLoteMock: jest.MockedFunction<
    (ids: number[], mes: number, ano: number, itens: unknown[]) => Promise<InserirCiclosEmLoteResult>
  >;

  const makeKit = (overrides: Partial<KitMensal> = {}): KitMensal =>
    Object.assign(new KitMensal(), {
      id: 1,
      idPlano: 2,
      mesReferencia: 4,
      anoReferencia: 2026,
      itens: [
        { nomeProduto: 'Caneca', quantidade: 1 },
        { nomeProduto: 'Vaso', quantidade: 2, observacao: 'Delicado' },
      ],
      ...overrides,
    });

  const makeAssinante = (id: number): Assinante =>
    Object.assign(new Assinante(), { id, status: StatusAssinante.ATIVO });

  beforeEach(() => {
    garantirKitPorIdMock = jest.fn<Promise<KitMensal>, [number]>();
    listarAssinantesPorPlanoMock = jest.fn<Promise<Assinante[]>, [number]>();
    inserirCiclosEmLoteMock = jest.fn();

    const kitMensalService = {
      garantirKitPorId: garantirKitPorIdMock,
    } as unknown as KitMensalService;

    const assinanteService = {
      listarAssinantesPorPlano: listarAssinantesPorPlanoMock,
    } as unknown as AssinanteService;

    const cicloService = {
      inserirCiclosEmLote: inserirCiclosEmLoteMock,
    } as unknown as CicloService;

    useCase = new GerarCiclosMensaisUseCase(kitMensalService, assinanteService, cicloService);
  });

  it('deve gerar ciclos para todos os assinantes ativos do plano', async () => {
    const kit = makeKit();
    const assinantes = [makeAssinante(10), makeAssinante(11), makeAssinante(12)];

    garantirKitPorIdMock.mockResolvedValue(kit);
    listarAssinantesPorPlanoMock.mockResolvedValue(assinantes);
    inserirCiclosEmLoteMock.mockResolvedValue({ criados: 3, ignorados: 0 });

    const result = await useCase.execute(1);

    expect(garantirKitPorIdMock).toHaveBeenCalledWith(1);
    expect(listarAssinantesPorPlanoMock).toHaveBeenCalledWith(2);
    expect(inserirCiclosEmLoteMock).toHaveBeenCalledWith(
      [10, 11, 12],
      4,
      2026,
      [
        { nomeProduto: 'Caneca', quantidade: 1, observacao: undefined },
        { nomeProduto: 'Vaso', quantidade: 2, observacao: 'Delicado' },
      ],
    );
    expect(result).toEqual({ criados: 3, ignorados: 0 });
  });

  it('deve retornar criados 0 e ignorados 0 quando não há assinantes', async () => {
    garantirKitPorIdMock.mockResolvedValue(makeKit());
    listarAssinantesPorPlanoMock.mockResolvedValue([]);

    const result = await useCase.execute(1);

    expect(inserirCiclosEmLoteMock).not.toHaveBeenCalled();
    expect(result).toEqual({ criados: 0, ignorados: 0 });
  });

  it('deve contabilizar ciclos já existentes como ignorados', async () => {
    const kit = makeKit();
    const assinantes = [makeAssinante(10), makeAssinante(11)];

    garantirKitPorIdMock.mockResolvedValue(kit);
    listarAssinantesPorPlanoMock.mockResolvedValue(assinantes);
    inserirCiclosEmLoteMock.mockResolvedValue({ criados: 1, ignorados: 1 });

    const result = await useCase.execute(1);

    expect(result).toEqual({ criados: 1, ignorados: 1 });
  });
});
