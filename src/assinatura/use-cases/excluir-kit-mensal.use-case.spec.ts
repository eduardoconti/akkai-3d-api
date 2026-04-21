import { NotFoundException } from '@nestjs/common';
import { KitMensal } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';
import { ExcluirKitMensalUseCase } from '@assinatura/use-cases';

describe('ExcluirKitMensalUseCase', () => {
  let useCase: ExcluirKitMensalUseCase;
  let garantirKitPorIdMock: jest.MockedFunction<
    (id: number) => Promise<KitMensal>
  >;
  let excluirKitMock: jest.MockedFunction<(id: number) => Promise<void>>;

  beforeEach(() => {
    garantirKitPorIdMock = jest.fn<Promise<KitMensal>, [number]>();
    excluirKitMock = jest.fn<Promise<void>, [number]>();

    const kitMensalService = {
      garantirKitPorId: garantirKitPorIdMock,
      excluirKit: excluirKitMock,
    } as unknown as KitMensalService;

    useCase = new ExcluirKitMensalUseCase(kitMensalService);
  });

  it('deve excluir o kit quando existe', async () => {
    garantirKitPorIdMock.mockResolvedValue(
      Object.assign(new KitMensal(), { id: 1 }),
    );
    excluirKitMock.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: 1 })).resolves.toBeUndefined();

    expect(garantirKitPorIdMock).toHaveBeenCalledWith(1);
    expect(excluirKitMock).toHaveBeenCalledWith(1);
  });

  it('deve lançar NotFoundException quando o kit não existe', async () => {
    garantirKitPorIdMock.mockRejectedValue(
      new NotFoundException('Kit mensal com ID 99 não encontrado.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(
      NotFoundException,
    );

    expect(excluirKitMock).not.toHaveBeenCalled();
  });
});
