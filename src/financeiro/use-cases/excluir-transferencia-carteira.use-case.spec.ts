import { NotFoundException } from '@nestjs/common';
import { TransferenciaCarteira } from '@financeiro/entities';
import { TransferenciaCarteiraService } from '@financeiro/services';
import { ExcluirTransferenciaCarteiraUseCase } from './excluir-transferencia-carteira.use-case';

describe('ExcluirTransferenciaCarteiraUseCase', () => {
  let useCase: ExcluirTransferenciaCarteiraUseCase;
  let transferenciaCarteiraService: {
    garantirTransferenciaPorId: jest.Mock;
    excluirTransferenciaCarteira: jest.Mock;
  };

  beforeEach(() => {
    transferenciaCarteiraService = {
      garantirTransferenciaPorId: jest.fn(),
      excluirTransferenciaCarteira: jest.fn(),
    };

    useCase = new ExcluirTransferenciaCarteiraUseCase(
      transferenciaCarteiraService as unknown as TransferenciaCarteiraService,
    );
  });

  it('deve excluir transferência de carteira', async () => {
    const transferencia = Object.assign(new TransferenciaCarteira(), { id: 1 });
    transferenciaCarteiraService.garantirTransferenciaPorId.mockResolvedValue(
      transferencia,
    );
    transferenciaCarteiraService.excluirTransferenciaCarteira.mockResolvedValue(
      undefined,
    );

    await useCase.execute({ id: 1 });

    expect(
      transferenciaCarteiraService.garantirTransferenciaPorId,
    ).toHaveBeenCalledWith(1);
    expect(
      transferenciaCarteiraService.excluirTransferenciaCarteira,
    ).toHaveBeenCalledWith(1);
  });

  it('deve propagar erro quando transferência não existir', async () => {
    transferenciaCarteiraService.garantirTransferenciaPorId.mockRejectedValue(
      new NotFoundException('Transferência com ID 99 não encontrada.'),
    );

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(
      NotFoundException,
    );
    expect(
      transferenciaCarteiraService.excluirTransferenciaCarteira,
    ).not.toHaveBeenCalled();
  });
});
