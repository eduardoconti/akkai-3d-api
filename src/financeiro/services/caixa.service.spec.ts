import { BadRequestException, ConflictException } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { StatusCaixa } from '@financeiro/enums';

describe('CaixaService', () => {
  const caixaRepository = {
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn((valor: object): object => valor),
    save: jest.fn((valor: object): Promise<object> => Promise.resolve(valor)),
    createQueryBuilder: jest.fn(),
  };
  const conferenciaRepository = {
    create: jest.fn((valor: object): object => valor),
    save: jest.fn((valor: object): Promise<object> => Promise.resolve(valor)),
  };
  const carteiraService = { garantirExisteCarteira: jest.fn() };
  const dataSource = { query: jest.fn() };
  const dataHoraAtual = new Date('2026-08-25T20:30:00.000Z');
  const dateService = {
    toUtcDateRange: jest.fn((data: string) => ({
      start: `${data} 03:00:00.000`,
      end: `${data} 23:59:59.999`,
    })),
    obterDataHoraAtual: jest.fn(() => dataHoraAtual),
  };
  let service: CaixaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CaixaService(
      caixaRepository as never,
      conferenciaRepository as never,
      carteiraService as never,
      dataSource as never,
      dateService as never,
    );
  });

  it('deve exigir caixa para venda de feira', async () => {
    await expect(
      service.garantirCaixaAbertoParaVenda({
        idFeira: 1,
        idsCarteiras: [2],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve pesquisar caixas com período, feira e paginação', async () => {
    const queryBuilder = {
      leftJoinAndMapOne: jest.fn(),
      andWhere: jest.fn(),
      orderBy: jest.fn(),
      addOrderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn(),
    };
    Object.values(queryBuilder).forEach((mock) =>
      mock.mockReturnValue(queryBuilder),
    );
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[{ id: 4 }], 1]);
    caixaRepository.createQueryBuilder.mockReturnValueOnce(queryBuilder);

    const resultado = await service.pesquisar({
      pagina: 2,
      tamanhoPagina: 10,
      dataInicio: '2026-08-01',
      dataFim: '2026-08-31',
      idFeira: 3,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
    expect(dateService.toUtcDateRange).toHaveBeenCalledWith('2026-08-01');
    expect(dateService.toUtcDateRange).toHaveBeenCalledWith('2026-08-31');
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(resultado).toMatchObject({
      pagina: 2,
      tamanhoPagina: 10,
      totalItens: 1,
      itens: [{ id: 4 }],
    });
  });

  it('deve retornar o caixa aberto com os dados das carteiras carregados', async () => {
    dataSource.query.mockResolvedValueOnce([{ existe: true }]);
    caixaRepository.exists.mockResolvedValueOnce(false);
    caixaRepository.save.mockResolvedValueOnce({ id: 4 });
    caixaRepository.findOne.mockResolvedValueOnce({
      id: 4,
      status: StatusCaixa.ABERTO,
      conferencias: [{ idCarteira: 2, carteira: { id: 2, nome: 'Dinheiro' } }],
    });

    const resultado = await service.abrir({
      idFeira: 1,
      idUsuario: 7,
      carteiras: [{ idCarteira: 2, valorAbertura: 20000 }],
    });

    expect(resultado.conferencias[0]!.carteira.nome).toBe('Dinheiro');
    expect(caixaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ dataAbertura: dataHoraAtual }),
    );
    expect(caixaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 4 },
      relations: { conferencias: { carteira: true } },
    });
  });

  it('deve rejeitar carteira que não participa do caixa', async () => {
    caixaRepository.findOne.mockResolvedValueOnce({
      id: 3,
      idFeira: 1,
      status: StatusCaixa.ABERTO,
      conferencias: [{ idCarteira: 2 }],
    });

    await expect(
      service.garantirCaixaAbertoParaVenda({
        idCaixa: 3,
        idFeira: 1,
        idsCarteiras: [9],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve calcular os valores esperados ao detalhar um caixa aberto', async () => {
    caixaRepository.findOne.mockResolvedValueOnce({
      id: 3,
      idFeira: 1,
      status: StatusCaixa.ABERTO,
      conferencias: [
        { idCarteira: 1, valorAbertura: 13000 },
        { idCarteira: 2, valorAbertura: 20000 },
      ],
    });
    dataSource.query.mockResolvedValueOnce([{ idCarteira: 1, total: '85000' }]);

    const resultado = await service.obterDetalhadoPorId(3);

    expect(resultado.conferencias).toEqual([
      expect.objectContaining({
        idCarteira: 1,
        totalEntradas: 85000,
        valorEsperadoFechamento: 98000,
      }),
      expect.objectContaining({
        idCarteira: 2,
        totalEntradas: 0,
        valorEsperadoFechamento: 20000,
      }),
    ]);
    expect(caixaRepository.save).not.toHaveBeenCalled();
  });

  it('deve manter os valores persistidos ao detalhar um caixa fechado', async () => {
    const caixa = {
      id: 3,
      status: StatusCaixa.FECHADO,
      conferencias: [
        {
          idCarteira: 1,
          valorAbertura: 13000,
          totalEntradas: 85000,
          valorEsperadoFechamento: 98000,
        },
      ],
    };
    caixaRepository.findOne.mockResolvedValueOnce(caixa);

    const resultado = await service.obterDetalhadoPorId(3);

    expect(resultado).toBe(caixa);
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('deve alterar os valores de abertura de um caixa aberto', async () => {
    const caixa = {
      id: 3,
      idFeira: 1,
      status: StatusCaixa.ABERTO,
      observacao: null,
      conferencias: [{ id: 8, idCarteira: 2, valorAbertura: 20000 }],
    };
    caixaRepository.findOne.mockResolvedValueOnce(caixa).mockResolvedValueOnce({
      ...caixa,
      conferencias: [
        {
          ...caixa.conferencias[0],
          carteira: { id: 2, nome: 'Dinheiro' },
        },
      ],
    });
    dataSource.query
      .mockResolvedValueOnce([{ existe: true }])
      .mockResolvedValueOnce([]);

    const resultado = await service.alterar(3, {
      idFeira: 1,
      observacao: '  Troco corrigido  ',
      carteiras: [{ idCarteira: 2, valorAbertura: 18000 }],
    });

    expect(caixaRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        observacao: 'Troco corrigido',
        conferencias: [
          expect.objectContaining({ idCarteira: 2, valorAbertura: 18000 }),
        ],
      }),
    );
    expect(resultado.conferencias[0]!.carteira.nome).toBe('Dinheiro');
  });

  it('deve impedir alteração de caixa fechado', async () => {
    caixaRepository.findOne.mockResolvedValueOnce({
      id: 3,
      idFeira: 1,
      status: StatusCaixa.FECHADO,
      conferencias: [{ idCarteira: 2, valorAbertura: 20000 }],
    });

    await expect(
      service.alterar(3, {
        idFeira: 1,
        carteiras: [{ idCarteira: 2, valorAbertura: 18000 }],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve impedir troca de feira após o início das vendas', async () => {
    caixaRepository.findOne.mockResolvedValueOnce({
      id: 3,
      idFeira: 1,
      status: StatusCaixa.ABERTO,
      conferencias: [{ idCarteira: 2, valorAbertura: 20000 }],
    });
    dataSource.query
      .mockResolvedValueOnce([{ existe: true }])
      .mockResolvedValueOnce([{ total: '1' }]);

    await expect(
      service.alterar(3, {
        idFeira: 4,
        carteiras: [{ idCarteira: 2, valorAbertura: 18000 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve calcular fechamento usando abertura e entradas da sessão', async () => {
    const caixa = {
      id: 3,
      idFeira: 1,
      status: StatusCaixa.ABERTO,
      conferencias: [{ idCarteira: 2, valorAbertura: 20000 }],
    };
    caixaRepository.findOne.mockResolvedValueOnce(caixa);
    dataSource.query.mockResolvedValueOnce([{ idCarteira: 2, total: '85000' }]);

    const resultado = await service.fechar(
      3,
      {
        carteiras: [{ idCarteira: 2, valorInformadoFechamento: 104700 }],
      },
      7,
    );

    expect(resultado.conferencias[0]).toMatchObject({
      totalEntradas: 85000,
      valorEsperadoFechamento: 105000,
      valorInformadoFechamento: 104700,
      diferenca: -300,
    });
    expect(resultado.status).toBe(StatusCaixa.FECHADO);
    expect(resultado.dataFechamento).toBe(dataHoraAtual);
  });
});
