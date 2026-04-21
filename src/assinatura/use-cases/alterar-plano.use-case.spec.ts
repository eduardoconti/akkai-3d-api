import { NotFoundException } from '@nestjs/common';
import { PlanoAssinatura } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';
import { AlterarPlanoInput, AlterarPlanoUseCase } from '@assinatura/use-cases';

describe('AlterarPlanoUseCase', () => {
  let useCase: AlterarPlanoUseCase;
  let garantirPlanoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<PlanoAssinatura>
  >;
  let salvarPlanoMock: jest.MockedFunction<
    (plano: PlanoAssinatura) => Promise<PlanoAssinatura>
  >;

  beforeEach(() => {
    garantirPlanoPorIdMock = jest.fn<Promise<PlanoAssinatura>, [number]>();
    salvarPlanoMock = jest.fn<Promise<PlanoAssinatura>, [PlanoAssinatura]>();

    const planoService = {
      garantirPlanoPorId: garantirPlanoPorIdMock,
      salvarPlano: salvarPlanoMock,
    } as unknown as PlanoService;

    useCase = new AlterarPlanoUseCase(planoService);
  });

  it('deve alterar e salvar o plano quando existe', async () => {
    const planoExistente = Object.assign(new PlanoAssinatura(), {
      id: 1,
      nome: 'Básico',
      valor: 4990,
      ativo: true,
    });
    const input: AlterarPlanoInput = {
      id: 1,
      nome: 'Premium',
      valor: 9990,
      ativo: false,
    };
    const planoSalvo = Object.assign(new PlanoAssinatura(), {
      ...planoExistente,
      ...input,
    });

    garantirPlanoPorIdMock.mockResolvedValue(planoExistente);
    salvarPlanoMock.mockResolvedValue(planoSalvo);

    const result = await useCase.execute(input);

    expect(garantirPlanoPorIdMock).toHaveBeenCalledWith(1);
    expect(salvarPlanoMock).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Premium', valor: 9990, ativo: false }),
    );
    expect(result).toBe(planoSalvo);
  });

  it('deve lançar NotFoundException quando o plano não existe', async () => {
    garantirPlanoPorIdMock.mockRejectedValue(
      new NotFoundException('Plano com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({ id: 99, nome: 'X', valor: 1000, ativo: true }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarPlanoMock).not.toHaveBeenCalled();
  });
});
