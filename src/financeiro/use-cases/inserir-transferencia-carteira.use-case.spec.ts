import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { TransferenciaCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TransferenciaCarteiraService,
} from '@financeiro/services';
import { InserirTransferenciaCarteiraUseCase } from './inserir-transferencia-carteira.use-case';

describe('InserirTransferenciaCarteiraUseCase', () => {
  let useCase: InserirTransferenciaCarteiraUseCase;
  let transferenciaCarteiraService: {
    inserirTransferenciaCarteira: jest.Mock;
  };
  let carteiraService: { garantirExisteCarteira: jest.Mock };

  beforeEach(() => {
    transferenciaCarteiraService = {
      inserirTransferenciaCarteira: jest.fn(),
    };
    carteiraService = { garantirExisteCarteira: jest.fn() };

    useCase = new InserirTransferenciaCarteiraUseCase(
      transferenciaCarteiraService as unknown as TransferenciaCarteiraService,
      carteiraService as unknown as CarteiraService,
      { usuarioId: 9 } as CurrentUserContext,
    );
  });

  it('deve inserir transferência entre carteiras', async () => {
    const transferenciaPersistida = Object.assign(new TransferenciaCarteira(), {
      id: 1,
    });
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    transferenciaCarteiraService.inserirTransferenciaCarteira.mockResolvedValue(
      transferenciaPersistida,
    );

    const result = await useCase.execute({
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
      dataTransferencia: '2026-06-10',
    });

    expect(result).toBe(transferenciaPersistida);
    expect(carteiraService.garantirExisteCarteira).toHaveBeenNthCalledWith(
      1,
      1,
    );
    expect(carteiraService.garantirExisteCarteira).toHaveBeenNthCalledWith(
      2,
      2,
    );

    const [transferencia] = transferenciaCarteiraService
      .inserirTransferenciaCarteira.mock.calls[0] as [TransferenciaCarteira];

    expect(transferencia).toMatchObject({
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
      idUsuarioInclusao: 9,
    });
    expect(transferencia.dataTransferencia).toEqual(new Date('2026-06-10'));
  });

  it('deve impedir transferência para a mesma carteira', async () => {
    await expect(
      useCase.execute({
        idCarteiraOrigem: 1,
        idCarteiraDestino: 1,
        valor: 10000,
        dataTransferencia: '2026-06-10',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(carteiraService.garantirExisteCarteira).not.toHaveBeenCalled();
    expect(
      transferenciaCarteiraService.inserirTransferenciaCarteira,
    ).not.toHaveBeenCalled();
  });

  it('deve propagar erro quando uma carteira não existir', async () => {
    carteiraService.garantirExisteCarteira.mockRejectedValue(
      new NotFoundException('Carteira com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        idCarteiraOrigem: 99,
        idCarteiraDestino: 2,
        valor: 10000,
        dataTransferencia: '2026-06-10',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(
      transferenciaCarteiraService.inserirTransferenciaCarteira,
    ).not.toHaveBeenCalled();
  });
});
