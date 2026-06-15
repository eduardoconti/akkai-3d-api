import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransferenciaCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TransferenciaCarteiraService,
} from '@financeiro/services';
import { AlterarTransferenciaCarteiraUseCase } from './alterar-transferencia-carteira.use-case';

describe('AlterarTransferenciaCarteiraUseCase', () => {
  let useCase: AlterarTransferenciaCarteiraUseCase;
  let transferenciaCarteiraService: {
    garantirTransferenciaPorId: jest.Mock;
    alterarTransferenciaCarteira: jest.Mock;
  };
  let carteiraService: { garantirExisteCarteira: jest.Mock };

  beforeEach(() => {
    transferenciaCarteiraService = {
      garantirTransferenciaPorId: jest.fn(),
      alterarTransferenciaCarteira: jest.fn(),
    };
    carteiraService = { garantirExisteCarteira: jest.fn() };

    useCase = new AlterarTransferenciaCarteiraUseCase(
      transferenciaCarteiraService as unknown as TransferenciaCarteiraService,
      carteiraService as unknown as CarteiraService,
    );
  });

  it('deve alterar transferência entre carteiras', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), {
      id: 1,
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
    });
    transferenciaCarteiraService.garantirTransferenciaPorId.mockResolvedValue(
      transferencia,
    );
    carteiraService.garantirExisteCarteira.mockResolvedValue(undefined);
    transferenciaCarteiraService.alterarTransferenciaCarteira.mockResolvedValue(
      transferencia,
    );

    const result = await useCase.execute({
      id: 1,
      idCarteiraOrigem: 2,
      idCarteiraDestino: 3,
      valor: 15000,
      dataTransferencia: '2026-06-12',
    });

    expect(
      transferenciaCarteiraService.garantirTransferenciaPorId,
    ).toHaveBeenCalledWith(1);
    expect(carteiraService.garantirExisteCarteira).toHaveBeenNthCalledWith(
      1,
      2,
    );
    expect(carteiraService.garantirExisteCarteira).toHaveBeenNthCalledWith(
      2,
      3,
    );
    expect(transferencia).toMatchObject({
      idCarteiraOrigem: 2,
      idCarteiraDestino: 3,
      valor: 15000,
    });
    expect(transferencia.dataTransferencia).toEqual(new Date('2026-06-12'));
    expect(result).toBe(transferencia);
  });

  it('deve impedir alteração para a mesma carteira', async () => {
    await expect(
      useCase.execute({
        id: 1,
        idCarteiraOrigem: 2,
        idCarteiraDestino: 2,
        valor: 10000,
        dataTransferencia: '2026-06-10',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(
      transferenciaCarteiraService.garantirTransferenciaPorId,
    ).not.toHaveBeenCalled();
  });

  it('deve propagar erro quando transferência não existir', async () => {
    transferenciaCarteiraService.garantirTransferenciaPorId.mockRejectedValue(
      new NotFoundException('Transferência com ID 99 não encontrada.'),
    );

    await expect(
      useCase.execute({
        id: 99,
        idCarteiraOrigem: 1,
        idCarteiraDestino: 2,
        valor: 10000,
        dataTransferencia: '2026-06-10',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(carteiraService.garantirExisteCarteira).not.toHaveBeenCalled();
  });
});
