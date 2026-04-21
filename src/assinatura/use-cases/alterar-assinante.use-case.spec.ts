import { NotFoundException } from '@nestjs/common';
import { Assinante, PlanoAssinatura, StatusAssinante } from '@assinatura/entities';
import { AssinanteService, PlanoService } from '@assinatura/services';
import { AlterarAssinanteInput, AlterarAssinanteUseCase } from '@assinatura/use-cases';

describe('AlterarAssinanteUseCase', () => {
  let useCase: AlterarAssinanteUseCase;
  let garantirAssinantePorIdMock: jest.MockedFunction<(id: number) => Promise<Assinante>>;
  let garantirPlanoPorIdMock: jest.MockedFunction<(id: number) => Promise<PlanoAssinatura>>;
  let salvarAssinanteMock: jest.MockedFunction<(a: Assinante) => Promise<Assinante>>;

  beforeEach(() => {
    garantirAssinantePorIdMock = jest.fn<Promise<Assinante>, [number]>();
    garantirPlanoPorIdMock = jest.fn<Promise<PlanoAssinatura>, [number]>();
    salvarAssinanteMock = jest.fn<Promise<Assinante>, [Assinante]>();

    const assinanteService = {
      garantirAssinantePorId: garantirAssinantePorIdMock,
      salvarAssinante: salvarAssinanteMock,
    } as unknown as AssinanteService;

    const planoService = {
      garantirPlanoPorId: garantirPlanoPorIdMock,
    } as unknown as PlanoService;

    useCase = new AlterarAssinanteUseCase(assinanteService, planoService);
  });

  it('deve alterar e salvar o assinante quando existe e o plano existe', async () => {
    const assinanteExistente = Object.assign(new Assinante(), {
      id: 1,
      nome: 'João',
      idPlano: 1,
      status: StatusAssinante.ATIVO,
    });
    const input: AlterarAssinanteInput = {
      id: 1,
      nome: 'João Atualizado',
      idPlano: 2,
      status: StatusAssinante.PAUSADO,
    };
    const assinanteSalvo = Object.assign(new Assinante(), { ...assinanteExistente, ...input });

    garantirAssinantePorIdMock.mockResolvedValue(assinanteExistente);
    garantirPlanoPorIdMock.mockResolvedValue(Object.assign(new PlanoAssinatura(), { id: 2 }));
    salvarAssinanteMock.mockResolvedValue(assinanteSalvo);

    const result = await useCase.execute(input);

    expect(garantirAssinantePorIdMock).toHaveBeenCalledWith(1);
    expect(garantirPlanoPorIdMock).toHaveBeenCalledWith(2);
    expect(salvarAssinanteMock).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'João Atualizado', status: StatusAssinante.PAUSADO }),
    );
    expect(result).toBe(assinanteSalvo);
  });

  it('deve lançar NotFoundException quando o assinante não existe', async () => {
    garantirAssinantePorIdMock.mockRejectedValue(
      new NotFoundException('Assinante com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({ id: 99, nome: 'X', idPlano: 1, status: StatusAssinante.ATIVO }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarAssinanteMock).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando o novo plano não existe', async () => {
    garantirAssinantePorIdMock.mockResolvedValue(
      Object.assign(new Assinante(), { id: 1 }),
    );
    garantirPlanoPorIdMock.mockRejectedValue(
      new NotFoundException('Plano com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({ id: 1, nome: 'X', idPlano: 99, status: StatusAssinante.ATIVO }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarAssinanteMock).not.toHaveBeenCalled();
  });
});
