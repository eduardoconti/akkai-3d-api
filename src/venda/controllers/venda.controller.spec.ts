import { Test, TestingModule } from '@nestjs/testing';
import { VendaController } from '@venda/controllers';
import { Feira, PrecoProdutoFeira, TipoVenda, Venda } from '@venda/entities';
import {
  FeiraService,
  PrecoProdutoFeiraService,
  VendaService,
} from '@venda/services';
import {
  AlterarFeiraUseCase,
  ExcluirFeiraUseCase,
  AlterarVendaUseCase,
  ExcluirVendaUseCase,
  InserirFeiraUseCase,
  InserirVendaUseCase,
} from '@venda/use-cases';

describe('VendaController', () => {
  let controller: VendaController;
  let vendaService: { listarVendas: jest.Mock };
  let feiraService: {
    listarFeiras: jest.Mock;
    pesquisarFeiras: jest.Mock;
    garantirFeiraPorId: jest.Mock;
  };
  let inserirFeiraUseCase: { execute: jest.Mock };
  let alterarFeiraUseCase: { execute: jest.Mock };
  let excluirFeiraUseCase: { execute: jest.Mock };
  let inserirVendaUseCase: { execute: jest.Mock };
  let alterarVendaUseCase: { execute: jest.Mock };
  let excluirVendaUseCase: { execute: jest.Mock };
  let precoProdutoFeiraService: {
    pesquisarPrecos: jest.Mock;
    listarPorFeira: jest.Mock;
    salvarPreco: jest.Mock;
    excluirPreco: jest.Mock;
  };

  beforeEach(async () => {
    vendaService = { listarVendas: jest.fn() };
    feiraService = {
      listarFeiras: jest.fn(),
      pesquisarFeiras: jest.fn(),
      garantirFeiraPorId: jest.fn(),
    };
    inserirFeiraUseCase = { execute: jest.fn() };
    alterarFeiraUseCase = { execute: jest.fn() };
    excluirFeiraUseCase = { execute: jest.fn() };
    inserirVendaUseCase = { execute: jest.fn() };
    alterarVendaUseCase = { execute: jest.fn() };
    excluirVendaUseCase = { execute: jest.fn() };
    precoProdutoFeiraService = {
      pesquisarPrecos: jest.fn(),
      listarPorFeira: jest.fn(),
      salvarPreco: jest.fn(),
      excluirPreco: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendaController],
      providers: [
        {
          provide: VendaService,
          useValue: vendaService,
        },
        {
          provide: FeiraService,
          useValue: feiraService,
        },
        {
          provide: InserirFeiraUseCase,
          useValue: inserirFeiraUseCase,
        },
        {
          provide: InserirVendaUseCase,
          useValue: inserirVendaUseCase,
        },
        {
          provide: AlterarFeiraUseCase,
          useValue: alterarFeiraUseCase,
        },
        {
          provide: ExcluirFeiraUseCase,
          useValue: excluirFeiraUseCase,
        },
        {
          provide: AlterarVendaUseCase,
          useValue: alterarVendaUseCase,
        },
        {
          provide: ExcluirVendaUseCase,
          useValue: excluirVendaUseCase,
        },
        {
          provide: PrecoProdutoFeiraService,
          useValue: precoProdutoFeiraService,
        },
      ],
    }).compile();

    controller = module.get<VendaController>(VendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar inserção de feira', async () => {
    inserirFeiraUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nome: 'Teatro Reviver',
      local: 'Niteroi',
    };

    const result = await controller.inserirFeira(input);

    expect(inserirFeiraUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar inserção de venda', async () => {
    inserirVendaUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      dataVenda: '2026-04-01T12:00:00.000Z',
      tipo: 'LOJA',
      itens: [{ idProduto: 1, quantidade: 1 }],
      pagamentos: [{ idCarteira: 1, meioPagamento: 'PIX', valor: 1000 }],
    };

    const result = await controller.inserirVenda(input as never);

    expect(inserirVendaUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de feira', async () => {
    alterarFeiraUseCase.execute.mockResolvedValue({ id: 2 });

    const input = {
      nome: 'Praça XV',
      local: 'Centro',
      descricao: 'Feira mensal',
      ativa: true,
    };

    const result = await controller.alterarFeira(2, input);

    expect(alterarFeiraUseCase.execute).toHaveBeenCalledWith({
      id: 2,
      ...input,
    });
    expect(result).toEqual({ id: 2 });
  });

  it('deve delegar exclusão de feira', async () => {
    excluirFeiraUseCase.execute.mockResolvedValue(undefined);

    await controller.excluirFeira(2);

    expect(excluirFeiraUseCase.execute).toHaveBeenCalledWith({ id: 2 });
  });

  it('deve delegar alteração de venda', async () => {
    alterarVendaUseCase.execute.mockResolvedValue({ id: 2 });

    const input = {
      dataVenda: '2026-04-01T12:00:00.000Z',
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
      itens: [{ idProduto: 1, quantidade: 2 }],
      pagamentos: [{ idCarteira: 1, meioPagamento: 'PIX', valor: 2000 }],
    };

    const result = await controller.alterarVenda(2, input as never);

    expect(alterarVendaUseCase.execute).toHaveBeenCalledWith({
      id: 2,
      ...input,
    });
    expect(result).toEqual({ id: 2 });
  });

  it('deve delegar exclusão de venda', async () => {
    excluirVendaUseCase.execute.mockResolvedValue(undefined);

    await controller.excluirVenda(2);

    expect(excluirVendaUseCase.execute).toHaveBeenCalledWith({ id: 2 });
  });

  it('deve listar vendas', async () => {
    const vendas = {
      itens: [Object.assign(new Venda(), { id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    vendaService.listarVendas.mockResolvedValue(vendas);

    const result = await controller.listarVendas({
      pagina: 1,
      tamanhoPagina: 10,
      dataInicio: '2026-04-04',
      dataFim: '2026-04-04',
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
    });

    expect(vendaService.listarVendas).toHaveBeenCalledWith({
      pagina: 1,
      tamanhoPagina: 10,
      dataInicio: '2026-04-04',
      dataFim: '2026-04-04',
      tipo: TipoVenda.FEIRA,
      idFeira: 3,
    });
    expect(result).toBe(vendas);
  });

  it('deve listar feiras', async () => {
    const feiras = [Object.assign(new Feira(), { id: 1 })];
    feiraService.listarFeiras.mockResolvedValue(feiras);

    const result = await controller.listarFeiras();

    expect(feiraService.listarFeiras).toHaveBeenCalled();
    expect(result).toBe(feiras);
  });

  it('deve listar feiras paginadas', async () => {
    const feiras = {
      itens: [Object.assign(new Feira(), { id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    feiraService.pesquisarFeiras.mockResolvedValue(feiras);

    const result = await controller.pesquisarFeiras({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(feiraService.pesquisarFeiras).toHaveBeenCalledWith({
      pagina: 1,
      tamanhoPagina: 10,
    });
    expect(result).toBe(feiras);
  });

  it('deve pesquisar preços de produtos por feira', async () => {
    const precos = {
      itens: [Object.assign(new PrecoProdutoFeira(), { id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    const pesquisa = {
      pagina: 1,
      tamanhoPagina: 10,
      idFeira: 3,
      termo: 'caneca',
      ordenarPor: 'codigo' as const,
      direcao: 'asc' as const,
    };
    precoProdutoFeiraService.pesquisarPrecos = jest
      .fn()
      .mockResolvedValue(precos);

    const result = await controller.pesquisarPrecosProdutosFeira(pesquisa);

    expect(precoProdutoFeiraService.pesquisarPrecos).toHaveBeenCalledWith(
      pesquisa,
    );
    expect(result).toBe(precos);
  });

  it('deve listar preços de produtos por feira', async () => {
    const precos = [Object.assign(new PrecoProdutoFeira(), { id: 1 })];
    precoProdutoFeiraService.listarPorFeira.mockResolvedValue(precos);

    const result = await controller.listarPrecosProdutosFeira(3);

    expect(precoProdutoFeiraService.listarPorFeira).toHaveBeenCalledWith(3);
    expect(result).toBe(precos);
  });

  it('deve salvar preço de produto por feira', async () => {
    const input = { idProduto: 10, valor: 1500 };
    const preco = Object.assign(new PrecoProdutoFeira(), input, {
      id: 1,
      idFeira: 3,
    });
    precoProdutoFeiraService.salvarPreco.mockResolvedValue(preco);

    const result = await controller.salvarPrecoProdutoFeira(3, input);

    expect(precoProdutoFeiraService.salvarPreco).toHaveBeenCalledWith(3, input);
    expect(result).toBe(preco);
  });

  it('deve excluir preço de produto por feira', async () => {
    precoProdutoFeiraService.excluirPreco.mockResolvedValue(undefined);

    await controller.excluirPrecoProdutoFeira(3, 10);

    expect(precoProdutoFeiraService.excluirPreco).toHaveBeenCalledWith(3, 10);
  });

  it('deve obter feira por id', async () => {
    const feira = Object.assign(new Feira(), { id: 3 });
    feiraService.garantirFeiraPorId.mockResolvedValue(feira);

    const result = await controller.obterFeiraPorId(3);

    expect(feiraService.garantirFeiraPorId).toHaveBeenCalledWith(3);
    expect(result).toBe(feira);
  });
});
