import { NotFoundException } from '@nestjs/common';
import { CicloAssinatura } from '@assinatura/entities';
import { CicloService } from '@assinatura/services';
import { ExcluirCicloUseCase } from '@assinatura/use-cases';

describe('ExcluirCicloUseCase', () => {
  let useCase: ExcluirCicloUseCase;
  let garantirCicloPorIdMock: jest.MockedFunction<
    (id: number) => Promise<CicloAssinatura>
  >;
  let excluirCicloMock: jest.MockedFunction<(id: number) => Promise<void>>;

  beforeEach(() => {
    garantirCicloPorIdMock = jest.fn<Promise<CicloAssinatura>, [number]>();
    excluirCicloMock = jest.fn<Promise<void>, [number]>();

    const cicloService = {
      garantirCicloPorId: garantirCicloPorIdMock,
      excluirCiclo: excluirCicloMock,
    } as unknown as CicloService;

    useCase = new ExcluirCicloUseCase(cicloService);
  });

  it('deve excluir o ciclo quando existe', async () => {
    garantirCicloPorIdMock.mockResolvedValue(
      Object.assign(new CicloAssinatura(), { id: 1 }),
    );
    excluirCicloMock.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: 1 })).resolves.toBeUndefined();

    expect(garantirCicloPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirCicloMock).toHaveBeenCalledWith(1);
  });

  it('deve lançar NotFoundException quando o ciclo não existe', async () => {
    garantirCicloPorIdMock.mockRejectedValue(
      new NotFoundException('Ciclo com ID 99 não encontrado.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(
      NotFoundException,
    );

    expect(excluirCicloMock).not.toHaveBeenCalled();
  });
});
