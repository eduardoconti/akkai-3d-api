import { NotFoundException } from '@nestjs/common';
import {
  Assinante,
  CicloAssinatura,
  CicloAssinaturaInput,
  StatusCiclo,
} from '@assinatura/entities';
import { AssinanteService, CicloService } from '@assinatura/services';
import { InserirCicloUseCase } from '@assinatura/use-cases';
import { ProdutoService } from '@produto/services';

describe('InserirCicloUseCase', () => {
  let useCase: InserirCicloUseCase;
  let garantirAssinantePorIdMock: jest.MockedFunction<
    (id: number) => Promise<Assinante>
  >;
  let garantirExisteProdutoMock: jest.MockedFunction<
    (id: number) => Promise<unknown>
  >;
  let salvarCicloMock: jest.MockedFunction<
    (c: CicloAssinatura) => Promise<CicloAssinatura>
  >;

  beforeEach(() => {
    garantirAssinantePorIdMock = jest.fn<Promise<Assinante>, [number]>();
    garantirExisteProdutoMock = jest.fn<Promise<unknown>, [number]>();
    salvarCicloMock = jest.fn<Promise<CicloAssinatura>, [CicloAssinatura]>();

    const cicloService = {
      salvarCiclo: salvarCicloMock,
    } as unknown as CicloService;
    const assinanteService = {
      garantirAssinantePorId: garantirAssinantePorIdMock,
    } as unknown as AssinanteService;
    const produtoService = {
      garantirExisteProduto: garantirExisteProdutoMock,
    } as unknown as ProdutoService;

    useCase = new InserirCicloUseCase(
      cicloService,
      assinanteService,
      produtoService,
    );
  });

  it('deve criar e salvar o ciclo quando o assinante existe', async () => {
    const input: CicloAssinaturaInput = {
      idAssinante: 1,
      mesReferencia: 4,
      anoReferencia: 2026,
      status: StatusCiclo.PENDENTE,
      itens: [{ idProduto: 1, quantidade: 1 }],
    };
    const cicloSalvo = Object.assign(new CicloAssinatura(), {
      id: 10,
      ...input,
    });

    garantirAssinantePorIdMock.mockResolvedValue(
      Object.assign(new Assinante(), { id: 1 }),
    );
    garantirExisteProdutoMock.mockResolvedValue({ id: 1 });
    salvarCicloMock.mockResolvedValue(cicloSalvo);

    const result = await useCase.execute(input);

    expect(garantirAssinantePorIdMock).toHaveBeenCalledWith(1);
    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(salvarCicloMock).toHaveBeenCalledWith(
      expect.objectContaining({
        idAssinante: 1,
        mesReferencia: 4,
        anoReferencia: 2026,
        status: StatusCiclo.PENDENTE,
      }),
    );
    expect(result).toBe(cicloSalvo);
  });

  it('deve aplicar status PENDENTE como padrão quando não informado', async () => {
    const input: CicloAssinaturaInput = {
      idAssinante: 1,
      mesReferencia: 4,
      anoReferencia: 2026,
      status: StatusCiclo.PENDENTE,
      itens: [],
    };

    garantirAssinantePorIdMock.mockResolvedValue(
      Object.assign(new Assinante(), { id: 1 }),
    );
    salvarCicloMock.mockResolvedValue(
      Object.assign(new CicloAssinatura(), { id: 1, ...input }),
    );

    await useCase.execute(input);

    expect(salvarCicloMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: StatusCiclo.PENDENTE }),
    );
  });

  it('deve lançar NotFoundException quando o assinante não existe', async () => {
    garantirAssinantePorIdMock.mockRejectedValue(
      new NotFoundException('Assinante com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({
        idAssinante: 99,
        mesReferencia: 4,
        anoReferencia: 2026,
        status: StatusCiclo.PENDENTE,
        itens: [],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(salvarCicloMock).not.toHaveBeenCalled();
  });
});
