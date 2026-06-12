import { NotFoundException } from '@nestjs/common';
import { CicloAssinatura, StatusCiclo } from '@assinatura/entities';
import { CicloService } from '@assinatura/services';
import { AlterarCicloInput, AlterarCicloUseCase } from '@assinatura/use-cases';
import { ProdutoService } from '@produto/services';

describe('AlterarCicloUseCase', () => {
  let useCase: AlterarCicloUseCase;
  let garantirCicloPorIdMock: jest.MockedFunction<
    (id: number) => Promise<CicloAssinatura>
  >;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<unknown>
  >;
  let salvarCicloMock: jest.MockedFunction<
    (c: CicloAssinatura) => Promise<CicloAssinatura>
  >;

  beforeEach(() => {
    garantirCicloPorIdMock = jest.fn<Promise<CicloAssinatura>, [number]>();
    garantirExisteProdutoMock = jest.fn<Promise<unknown>, [number]>();
    salvarCicloMock = jest.fn<Promise<CicloAssinatura>, [CicloAssinatura]>();

    const cicloService = {
      garantirCicloPorId: garantirCicloPorIdMock,
      salvarCiclo: salvarCicloMock,
    } as unknown as CicloService;
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
    } as unknown as ProdutoService;

    useCase = new AlterarCicloUseCase(cicloService, produtoService);
  });

  it('deve alterar e salvar o ciclo quando existe', async () => {
    const cicloExistente = Object.assign(new CicloAssinatura(), {
      id: 1,
      idAssinante: 5,
      mesReferencia: 4,
      anoReferencia: 2026,
      status: StatusCiclo.PENDENTE,
      itens: [],
    });
    const input: AlterarCicloInput = {
      id: 1,
      status: StatusCiclo.ENVIADO,
      codigoRastreio: 'BR123456789',
      itens: [{ idProduto: 1, quantidade: 1 }],
    };
    const cicloSalvo = Object.assign(new CicloAssinatura(), {
      ...cicloExistente,
      ...input,
    });

    garantirCicloPorIdMock.mockResolvedValue(cicloExistente);
    garantirExisteProdutoMock.mockResolvedValue({ id: 1 });
    salvarCicloMock.mockResolvedValue(cicloSalvo);

    const result = await useCase.execute(input);

    expect(garantirCicloPorIdMock).toHaveBeenCalledWith(1);
    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(salvarCicloMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: StatusCiclo.ENVIADO,
        codigoRastreio: 'BR123456789',
      }),
    );
    expect(result).toBe(cicloSalvo);
  });

  it('deve preservar idAssinante, mes e ano da referência originais', async () => {
    const cicloExistente = Object.assign(new CicloAssinatura(), {
      id: 1,
      idAssinante: 5,
      mesReferencia: 4,
      anoReferencia: 2026,
      status: StatusCiclo.PENDENTE,
      itens: [],
    });

    garantirCicloPorIdMock.mockResolvedValue(cicloExistente);
    salvarCicloMock.mockImplementation((c) => Promise.resolve(c));

    await useCase.execute({ id: 1, status: StatusCiclo.EM_PREPARO, itens: [] });

    expect(salvarCicloMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idAssinante: 5,
        mesReferencia: 4,
        anoReferencia: 2026,
      }),
    );
  });

  it('deve lançar NotFoundException quando o ciclo não existe', async () => {
    garantirCicloPorIdMock.mockRejectedValue(
      new NotFoundException('Ciclo com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({ id: 99, status: StatusCiclo.ENVIADO, itens: [] }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarCicloMock).not.toHaveBeenCalled();
  });
});
