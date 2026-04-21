import { NotFoundException } from '@nestjs/common';
import {
  KitMensal,
  KitMensalInput,
  PlanoAssinatura,
} from '@assinatura/entities';
import { KitMensalService, PlanoService } from '@assinatura/services';
import { InserirKitMensalUseCase } from '@assinatura/use-cases';
import { ProdutoService } from '@produto/services';

describe('InserirKitMensalUseCase', () => {
  let useCase: InserirKitMensalUseCase;
  let garantirPlanoPorIdMock: jest.MockedFunction<
    (id: number) => Promise<PlanoAssinatura>
  >;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<unknown>
  >;
  let salvarKitMock: jest.MockedFunction<
    (kit: KitMensal) => Promise<KitMensal>
  >;

  beforeEach(() => {
    garantirPlanoPorIdMock = jest.fn<Promise<PlanoAssinatura>, [number]>();
    garantirExisteProdutoMock = jest.fn<Promise<unknown>, [number]>();
    salvarKitMock = jest.fn<Promise<KitMensal>, [KitMensal]>();

    const planoService = {
      garantirPlanoPorId: garantirPlanoPorIdMock,
    } as unknown as PlanoService;
    const kitMensalService = {
      salvarKit: salvarKitMock,
    } as unknown as KitMensalService;
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
    } as unknown as ProdutoService;

    useCase = new InserirKitMensalUseCase(
      kitMensalService,
      planoService,
      produtoService,
    );
  });

  it('deve criar e salvar o kit quando o plano existe', async () => {
    const input: KitMensalInput = {
      idPlano: 1,
      mesReferencia: 4,
      anoReferencia: 2026,
      itens: [{ idProduto: 1, quantidade: 2 }],
    };
    const kitSalvo = Object.assign(new KitMensal(), { id: 10, ...input });

    garantirPlanoPorIdMock.mockResolvedValue(
      Object.assign(new PlanoAssinatura(), { id: 1 }),
    );
    garantirExisteProdutoMock.mockResolvedValue({ id: 1 });
    salvarKitMock.mockResolvedValue(kitSalvo);

    const result = await useCase.execute(input);

    expect(garantirPlanoPorIdMock).toHaveBeenCalledWith(1);
    expect(salvarKitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idPlano: 1,
        mesReferencia: 4,
        anoReferencia: 2026,
      }),
    );
    expect(result).toBe(kitSalvo);
  });

  it('deve lançar NotFoundException quando o plano não existe', async () => {
    garantirPlanoPorIdMock.mockRejectedValue(
      new NotFoundException('Plano com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({
        idPlano: 99,
        mesReferencia: 4,
        anoReferencia: 2026,
        itens: [],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarKitMock).not.toHaveBeenCalled();
  });
});
