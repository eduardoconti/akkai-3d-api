import { NotFoundException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { AjusteCarteira, TipoAjusteCarteira } from '@financeiro/entities';
import { AjusteCarteiraService, CarteiraService } from '@financeiro/services';
import { InserirAjusteCarteiraUseCase } from '@financeiro/use-cases';

describe('InserirAjusteCarteiraUseCase', () => {
  let useCase: InserirAjusteCarteiraUseCase;
  let garantirExisteCarteiraMock: jest.MockedFunction<
    (id: number) => Promise<void>
  >;
  let inserirAjusteCarteiraMock: jest.MockedFunction<
    (ajuste: AjusteCarteira) => Promise<AjusteCarteira>
  >;
  let currentUserContext: { usuarioId: number };

  beforeEach(() => {
    garantirExisteCarteiraMock = jest.fn<Promise<void>, [number]>();
    inserirAjusteCarteiraMock = jest.fn<
      Promise<AjusteCarteira>,
      [AjusteCarteira]
    >();
    currentUserContext = { usuarioId: 7 };

    const ajusteCarteiraService = {
      inserirAjusteCarteira: inserirAjusteCarteiraMock,
    } as unknown as AjusteCarteiraService;

    const carteiraService = {
      garantirExisteCarteira: garantirExisteCarteiraMock,
    } as unknown as CarteiraService;

    useCase = new InserirAjusteCarteiraUseCase(
      ajusteCarteiraService,
      carteiraService,
      currentUserContext as CurrentUserContext,
    );
  });

  it('deve inserir ajuste quando carteira existir', async () => {
    const ajustePersistido = Object.assign(new AjusteCarteira(), { id: 1 });
    garantirExisteCarteiraMock.mockResolvedValue(undefined);
    inserirAjusteCarteiraMock.mockResolvedValue(ajustePersistido);

    const result = await useCase.execute({
      idCarteira: 3,
      dataAjuste: '2026-06-10',
      tipo: TipoAjusteCarteira.DEBITO,
      valor: 2500,
      motivo: 'Correção de saldo',
      observacao: 'Conferência manual',
    });

    expect(garantirExisteCarteiraMock).toHaveBeenCalledWith(3);
    expect(inserirAjusteCarteiraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idCarteira: 3,
        tipo: TipoAjusteCarteira.DEBITO,
        valor: 2500,
        motivo: 'Correção de saldo',
        observacao: 'Conferência manual',
        idUsuarioInclusao: 7,
      }),
    );
    expect(result).toBe(ajustePersistido);
  });

  it('deve lançar erro quando carteira não existir', async () => {
    garantirExisteCarteiraMock.mockRejectedValue(
      new NotFoundException('Carteira com ID 3 não encontrada.'),
    );

    await expect(
      useCase.execute({
        idCarteira: 3,
        dataAjuste: '2026-06-10',
        tipo: TipoAjusteCarteira.CREDITO,
        valor: 5000,
        motivo: 'Correção de saldo',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
