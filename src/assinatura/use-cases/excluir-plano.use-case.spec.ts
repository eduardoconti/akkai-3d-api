import { NotFoundException } from '@nestjs/common';
import { PlanoAssinatura } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';
import { ExcluirPlanoUseCase } from '@assinatura/use-cases';

describe('ExcluirPlanoUseCase', () => {
  let useCase: ExcluirPlanoUseCase;
  let garantirPlanoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<PlanoAssinatura>
  >;
  let excluirPlanoMock: jest.MockedFunction<(id: number) => Promise<void>>;

  beforeEach(() => {
    garantirPlanoPorIdMock = jest.fn<Promise<PlanoAssinatura>, [number]>();
    excluirPlanoMock = jest.fn<Promise<void>, [number]>();

    const planoService = {
      garantirPlanoPorId: garantirPlanoPorIdMock,
      excluirPlano: excluirPlanoMock,
    } as unknown as PlanoService;

    useCase = new ExcluirPlanoUseCase(planoService);
  });

  it('deve excluir o plano quando existe', async () => {
    const plano = Object.assign(new PlanoAssinatura(), { id: 1 });
    garantirPlanoPorIdMock.mockResolvedValue(plano);
    excluirPlanoMock.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: 1 })).resolves.toBeUndefined();

    expect(garantirPlanoPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirPlanoMock).toHaveBeenCalledWith(1);
  });

  it('deve lançar NotFoundException quando o plano não existe', async () => {
    garantirPlanoPorIdMock.mockRejectedValue(
      new NotFoundException('Plano com ID 99 não encontrado.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(
      NotFoundException,
    );

    expect(excluirPlanoMock).not.toHaveBeenCalled();
  });
});
