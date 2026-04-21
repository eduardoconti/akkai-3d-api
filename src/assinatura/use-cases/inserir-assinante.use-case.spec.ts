import { NotFoundException } from '@nestjs/common';
import {
  Assinante,
  AssinanteInput,
  PlanoAssinatura,
  StatusAssinante,
} from '@assinatura/entities';
import { AssinanteService, PlanoService } from '@assinatura/services';
import { InserirAssinanteUseCase } from '@assinatura/use-cases';

describe('InserirAssinanteUseCase', () => {
  let useCase: InserirAssinanteUseCase;
  let garantirPlanoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<PlanoAssinatura>
  >;
  let salvarAssinanteMock: jest.MockedFunction<
    (a: Assinante) => Promise<Assinante>
  >;

  beforeEach(() => {
    garantirPlanoPorIdMock = jest.fn<Promise<PlanoAssinatura>, [number]>();
    salvarAssinanteMock = jest.fn<Promise<Assinante>, [Assinante]>();

    const planoService = {
      garantirPlanoPorId: garantirPlanoPorIdMock,
    } as unknown as PlanoService;
    const assinanteService = {
      salvarAssinante: salvarAssinanteMock,
    } as unknown as AssinanteService;

    useCase = new InserirAssinanteUseCase(assinanteService, planoService);
  });

  it('deve criar e salvar o assinante quando o plano existe', async () => {
    const input: AssinanteInput = {
      nome: 'João Silva',
      email: 'joao@email.com',
      idPlano: 1,
      status: StatusAssinante.ATIVO,
    };
    const plano = Object.assign(new PlanoAssinatura(), { id: 1 });
    const assinanteSalvo = Object.assign(new Assinante(), { id: 10, ...input });

    garantirPlanoPorIdMock.mockResolvedValue(plano);
    salvarAssinanteMock.mockResolvedValue(assinanteSalvo);

    const result = await useCase.execute(input);

    expect(garantirPlanoPorIdMock).toHaveBeenCalledWith(1);
    expect(salvarAssinanteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Silva',
        email: 'joao@email.com',
        idPlano: 1,
        status: StatusAssinante.ATIVO,
      }),
    );
    expect(result).toBe(assinanteSalvo);
  });

  it('deve aplicar status ATIVO como padrão quando não informado', async () => {
    const input: AssinanteInput = {
      nome: 'Maria',
      idPlano: 1,
      status: StatusAssinante.ATIVO,
    };

    garantirPlanoPorIdMock.mockResolvedValue(
      Object.assign(new PlanoAssinatura(), { id: 1 }),
    );
    salvarAssinanteMock.mockResolvedValue(
      Object.assign(new Assinante(), { id: 1, ...input }),
    );

    await useCase.execute(input);

    expect(salvarAssinanteMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusAssinante.ATIVO }),
    );
  });

  it('deve lançar NotFoundException quando o plano não existe', async () => {
    garantirPlanoPorIdMock.mockRejectedValue(
      new NotFoundException('Plano com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({
        nome: 'X',
        idPlano: 99,
        status: StatusAssinante.ATIVO,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarAssinanteMock).not.toHaveBeenCalled();
  });
});
