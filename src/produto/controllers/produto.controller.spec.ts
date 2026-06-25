import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from '@produto/controllers';
import {
  CategoriaProduto,
  OrigemMovimentacaoEstoque,
  StatusProduto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import {
  AlterarCategoriaProdutoUseCase,
  AlterarProdutoUseCase,
  AlterarStatusProdutoUseCase,
  EntradaEstoqueUseCase,
  ExcluirCategoriaProdutoUseCase,
  ExcluirProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
  SaidaEstoqueUseCase,
} from '@produto/use-cases';
import {
  CategoriaProdutoService,
  EstoqueService,
  ProdutoService,
} from '@produto/services';
import {
  DetalheProdutoDto,
  ListarMovimentacaoEstoqueDto,
  ListarProdutoDto,
} from '@produto/dto';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let inserirProdutoUseCase: { execute: jest.Mock };
  let alterarProdutoUseCase: { execute: jest.Mock };
  let alterarStatusProdutoUseCase: { execute: jest.Mock };
  let alterarCategoriaProdutoUseCase: { execute: jest.Mock };
  let excluirProdutoUseCase: { execute: jest.Mock };
  let excluirCategoriaProdutoUseCase: { execute: jest.Mock };
  let inserirCategoriaProdutoUseCase: { execute: jest.Mock };
  let entradaEstoqueUseCase: { execute: jest.Mock };
  let saidaEstoqueUseCase: { execute: jest.Mock };
  let produtoService: {
    listarProdutos: jest.Mock;
    obterDetalheProdutoPorId: jest.Mock;
  };
  let categoriaProdutoService: {
    listarCategorias: jest.Mock;
    garantirCategoriaPorId: jest.Mock;
  };
  let estoqueService: {
    listarMovimentacoes: jest.Mock;
    listarMovimentacoesPorProduto: jest.Mock;
  };

  beforeEach(async () => {
    inserirProdutoUseCase = { execute: jest.fn() };
    alterarProdutoUseCase = { execute: jest.fn() };
    alterarStatusProdutoUseCase = { execute: jest.fn() };
    alterarCategoriaProdutoUseCase = { execute: jest.fn() };
    excluirProdutoUseCase = { execute: jest.fn() };
    excluirCategoriaProdutoUseCase = { execute: jest.fn() };
    inserirCategoriaProdutoUseCase = { execute: jest.fn() };
    entradaEstoqueUseCase = { execute: jest.fn() };
    saidaEstoqueUseCase = { execute: jest.fn() };
    produtoService = {
      listarProdutos: jest.fn(),
      obterDetalheProdutoPorId: jest.fn(),
    };
    categoriaProdutoService = {
      listarCategorias: jest.fn(),
      garantirCategoriaPorId: jest.fn(),
    };
    estoqueService = {
      listarMovimentacoes: jest.fn(),
      listarMovimentacoesPorProduto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: InserirProdutoUseCase,
          useValue: inserirProdutoUseCase,
        },
        {
          provide: AlterarProdutoUseCase,
          useValue: alterarProdutoUseCase,
        },
        {
          provide: AlterarStatusProdutoUseCase,
          useValue: alterarStatusProdutoUseCase,
        },
        {
          provide: AlterarCategoriaProdutoUseCase,
          useValue: alterarCategoriaProdutoUseCase,
        },
        {
          provide: ExcluirProdutoUseCase,
          useValue: excluirProdutoUseCase,
        },
        {
          provide: ExcluirCategoriaProdutoUseCase,
          useValue: excluirCategoriaProdutoUseCase,
        },
        {
          provide: InserirCategoriaProdutoUseCase,
          useValue: inserirCategoriaProdutoUseCase,
        },
        {
          provide: EntradaEstoqueUseCase,
          useValue: entradaEstoqueUseCase,
        },
        {
          provide: SaidaEstoqueUseCase,
          useValue: saidaEstoqueUseCase,
        },
        {
          provide: ProdutoService,
          useValue: produtoService,
        },
        {
          provide: CategoriaProdutoService,
          useValue: categoriaProdutoService,
        },
        {
          provide: EstoqueService,
          useValue: estoqueService,
        },
      ],
    }).compile();

    controller = module.get<ProdutoController>(ProdutoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar inserção de produto', async () => {
    inserirProdutoUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nome: 'Caneca',
      codigo: 1001,
      idCategoria: 1,
      valor: 2500,
    };

    const result = await controller.inserirProduto(input);

    expect(inserirProdutoUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de produto', async () => {
    alterarProdutoUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nome: 'Caneca Premium',
      codigo: 1002,
      descricao: 'Nova versao',
      idCategoria: 2,
      valor: 3500,
    };

    const result = await controller.alterarProduto(1, input);

    expect(alterarProdutoUseCase.execute).toHaveBeenCalledWith({
      id: 1,
      ...input,
    });
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de status do produto', async () => {
    alterarStatusProdutoUseCase.execute.mockResolvedValue({
      id: 1,
      status: StatusProduto.INATIVO,
    });

    const result = await controller.alterarStatusProduto(1, {
      status: StatusProduto.INATIVO,
    });

    expect(alterarStatusProdutoUseCase.execute).toHaveBeenCalledWith({
      id: 1,
      status: StatusProduto.INATIVO,
    });
    expect(result).toEqual({ id: 1, status: StatusProduto.INATIVO });
  });

  it('deve delegar exclusão de produto', async () => {
    excluirProdutoUseCase.execute.mockResolvedValue(undefined);

    await controller.excluirProduto(1);

    expect(excluirProdutoUseCase.execute).toHaveBeenCalledWith({ id: 1 });
  });

  it('deve listar produtos', async () => {
    const resposta = {
      itens: [
        {
          id: 1,
          nome: 'Caneca',
          codigo: 1001,
          descricao: 'Modelo geek',
          idCategoria: 2,
          estoqueMinimo: 3,
          valor: 2500,
          status: StatusProduto.ATIVO,
          quantidadeEstoque: 9,
          categoria: { id: 2, nome: 'Canecas' },
        },
      ] satisfies ListarProdutoDto[],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    produtoService.listarProdutos.mockResolvedValue(resposta);

    const result = await controller.listarProdutos({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(produtoService.listarProdutos).toHaveBeenCalledWith({
      pagina: 1,
      tamanhoPagina: 10,
    });
    expect(result).toBe(resposta);
  });

  it('deve listar categorias', async () => {
    const resposta = {
      itens: [Object.assign(new CategoriaProduto(), { id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    categoriaProdutoService.listarCategorias.mockResolvedValue(resposta);

    const result = await controller.listarCategorias({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(categoriaProdutoService.listarCategorias).toHaveBeenCalledWith({
      pagina: 1,
      tamanhoPagina: 10,
    });
    expect(result).toBe(resposta);
  });

  it('deve delegar inserção de categoria', async () => {
    inserirCategoriaProdutoUseCase.execute.mockResolvedValue({ id: 2 });

    const input = { nome: 'Canecas' };

    const result = await controller.inserirCategoria(input);

    expect(inserirCategoriaProdutoUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 2 });
  });

  it('deve buscar categoria por id', async () => {
    const categoria = Object.assign(new CategoriaProduto(), {
      id: 2,
      nome: 'Canecas',
      idAscendente: 1,
    });
    categoriaProdutoService.garantirCategoriaPorId.mockResolvedValue(categoria);

    const result = await controller.obterCategoriaPorId(2);

    expect(categoriaProdutoService.garantirCategoriaPorId).toHaveBeenCalledWith(
      2,
    );
    expect(result).toBe(categoria);
  });

  it('deve delegar alteração de categoria', async () => {
    alterarCategoriaProdutoUseCase.execute.mockResolvedValue({ id: 2 });

    const input = {
      nome: 'Canecas Premium',
      idAscendente: 1,
    };

    const result = await controller.alterarCategoria(2, input);

    expect(alterarCategoriaProdutoUseCase.execute).toHaveBeenCalledWith({
      id: 2,
      ...input,
    });
    expect(result).toEqual({ id: 2 });
  });

  it('deve delegar exclusão de categoria', async () => {
    excluirCategoriaProdutoUseCase.execute.mockResolvedValue(undefined);

    await controller.excluirCategoria(2);

    expect(excluirCategoriaProdutoUseCase.execute).toHaveBeenCalledWith({
      id: 2,
    });
  });

  it('deve buscar produto por id', async () => {
    const detalhe: DetalheProdutoDto = {
      id: 1,
      nome: 'Caneca',
      codigo: 1001,
      idCategoria: 1,
      valor: 2500,
      status: StatusProduto.ATIVO,
      categoria: { id: 1, nome: 'Canecas' },
      quantidadeEstoque: 10,
    };
    produtoService.obterDetalheProdutoPorId.mockResolvedValue(detalhe);

    const result = await controller.getProdutoById(1);

    expect(produtoService.obterDetalheProdutoPorId).toHaveBeenCalledWith(1);
    expect(result).toBe(detalhe);
  });

  it('deve delegar entrada de estoque', async () => {
    entradaEstoqueUseCase.execute.mockResolvedValue(undefined);

    await controller.entradaEstoque(1, {
      quantidade: 10,
      origem: OrigemMovimentacaoEstoque.COMPRA,
    });

    expect(entradaEstoqueUseCase.execute).toHaveBeenCalledWith({
      idProduto: 1,
      quantidade: 10,
      origem: OrigemMovimentacaoEstoque.COMPRA,
    });
  });

  it('deve delegar saída de estoque', async () => {
    saidaEstoqueUseCase.execute.mockResolvedValue(undefined);

    await controller.saidaEstoque(1, {
      quantidade: 2,
      origem: OrigemMovimentacaoEstoque.PERDA,
    });

    expect(saidaEstoqueUseCase.execute).toHaveBeenCalledWith({
      idProduto: 1,
      quantidade: 2,
      origem: OrigemMovimentacaoEstoque.PERDA,
    });
  });

  it('deve listar movimentações de estoque de um produto', async () => {
    const resposta = {
      itens: [
        {
          id: 11,
          idProduto: 1,
          usuario: 'Eduardo',
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
        },
      ] satisfies ListarMovimentacaoEstoqueDto[],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    estoqueService.listarMovimentacoesPorProduto.mockResolvedValue(resposta);

    const result = await controller.listarMovimentacoesEstoque(1, {
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(estoqueService.listarMovimentacoesPorProduto).toHaveBeenCalledWith(
      1,
      {
        pagina: 1,
        tamanhoPagina: 10,
      },
    );
    expect(result).toBe(resposta);
  });

  it('deve listar movimentações de estoque dos produtos', async () => {
    const resposta = {
      itens: [
        {
          id: 11,
          idProduto: 1,
          usuario: 'Eduardo',
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.ENTRADA,
          origem: OrigemMovimentacaoEstoque.PRODUCAO,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
          produto: { id: 1, codigo: 4001, nome: 'Cubo Infinito' },
        },
      ] satisfies ListarMovimentacaoEstoqueDto[],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    estoqueService.listarMovimentacoes.mockResolvedValue(resposta);

    const pesquisa = {
      pagina: 1,
      tamanhoPagina: 10,
      tipos: [TipoMovimentacaoEstoque.ENTRADA],
      origens: [OrigemMovimentacaoEstoque.PRODUCAO],
      idProduto: 1,
    };

    const result =
      await controller.listarMovimentacoesEstoqueProdutos(pesquisa);

    expect(estoqueService.listarMovimentacoes).toHaveBeenCalledWith(pesquisa);
    expect(result).toBe(resposta);
  });
});
