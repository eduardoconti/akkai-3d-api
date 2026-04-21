import { NotFoundException } from '@nestjs/common';
import { Assinante } from '@assinatura/entities';
import { AssinanteService } from '@assinatura/services';
import { ExcluirAssinanteUseCase } from '@assinatura/use-cases';

describe('ExcluirAssinanteUseCase', () => {
  let useCase: ExcluirAssinanteUseCase;
  let garantirAssinantePorIdMock: jest.MockedFunction<(id: number) => Promise<Assinante>>;
  let excluirAssinanteMock: jest.MockedFunction<(id: number) => Promise<void>>;

  beforeEach(() => {
    garantirAssinantePorIdMock = jest.fn<Promise<Assinante>, [number]>();
    excluirAssinanteMock = jest.fn<Promise<void>, [number]>();

    const assinanteService = {
      garantirAssinantePorId: garantirAssinantePorIdMock,
      excluirAssinante: excluirAssinanteMock,
    } as unknown as AssinanteService;

    useCase = new ExcluirAssinanteUseCase(assinanteService);
  });

  it('deve excluir o assinante quando existe', async () => {
    garantirAssinantePorIdMock.mockResolvedValue(Object.assign(new Assinante(), { id: 1 }));
    excluirAssinanteMock.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: 1 })).resolves.toBeUndefined();

    expect(garantirAssinantePorIdMock).toHaveBeenCalledWith(1);
    expect(excluirAssinanteMock).toHaveBeenCalledWith(1);
  });

  it('deve lançar NotFoundException quando o assinante não existe', async () => {
    garantirAssinantePorIdMock.mockRejectedValue(
      new NotFoundException('Assinante com ID 99 não encontrado.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(NotFoundException);

    expect(excluirAssinanteMock).not.toHaveBeenCalled();
  });
});
