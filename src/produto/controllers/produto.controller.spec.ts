import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from '@produto/controllers';
import { CategoriaProduto, OrigemMovimentacaoEstoque } from '@produto/entities';
import {
  AlterarCategoriaProdutoUseCase,
  AlterarProdutoUseCase,
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
} from '@produto/use-cases';
import { ProdutoService } from '@produto/services';
import { DetalheProdutoDto, ListarProdutoDto } from '@produto/dto';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let inserirProdutoUseCase: { execute: jest.Mock };
  let alterarProdutoUseCase: { execute: jest.Mock };
  let alterarCategoriaProdutoUseCase: { execute: jest.Mock };
  let inserirCategoriaProdutoUseCase: { execute: jest.Mock };
  let produtoService: {
    listarProdutos: jest.Mock;
    listarCategorias: jest.Mock;
    obterCategoriaPorId: jest.Mock;
    obterDetalheProdutoPorId: jest.Mock;
    entradaEstoque: jest.Mock;
    saidaEstoque: jest.Mock;
  };

  beforeEach(async () => {
    inserirProdutoUseCase = { execute: jest.fn() };
    alterarProdutoUseCase = { execute: jest.fn() };
    alterarCategoriaProdutoUseCase = { execute: jest.fn() };
    inserirCategoriaProdutoUseCase = { execute: jest.fn() };
    produtoService = {
      listarProdutos: jest.fn(),
      listarCategorias: jest.fn(),
      obterCategoriaPorId: jest.fn(),
      obterDetalheProdutoPorId: jest.fn(),
      entradaEstoque: jest.fn(),
      saidaEstoque: jest.fn(),
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
          provide: AlterarCategoriaProdutoUseCase,
          useValue: alterarCategoriaProdutoUseCase,
        },
        {
          provide: InserirCategoriaProdutoUseCase,
          useValue: inserirCategoriaProdutoUseCase,
        },
        {
          provide: ProdutoService,
          useValue: produtoService,
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
      codigo: 'CAN001',
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
      codigo: 'CAN002',
      descricao: 'Nova versao',
      idCategoria: 2,
      valor: 3500,
    };

    const result = await controller.alterarProduto(1, input);

    expect(alterarProdutoUseCase.execute).toHaveBeenCalledWith(1, input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve listar produtos', async () => {
    const resposta = {
      itens: [
        {
          id: 1,
          nome: 'Caneca',
          codigo: 'CAN001',
          descricao: 'Modelo geek',
          idCategoria: 2,
          estoqueMinimo: 3,
          valor: 2500,
          categoria: { id: 2, nome: 'Canecas' },
          quantidadeEstoque: 9,
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
    const categorias = [Object.assign(new CategoriaProduto(), { id: 1 })];
    produtoService.listarCategorias.mockResolvedValue(categorias);

    const result = await controller.listarCategorias();

    expect(produtoService.listarCategorias).toHaveBeenCalled();
    expect(result).toBe(categorias);
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
    produtoService.obterCategoriaPorId.mockResolvedValue(categoria);

    const result = await controller.obterCategoriaPorId(2);

    expect(produtoService.obterCategoriaPorId).toHaveBeenCalledWith(2);
    expect(result).toBe(categoria);
  });

  it('deve delegar alteração de categoria', async () => {
    alterarCategoriaProdutoUseCase.execute.mockResolvedValue({ id: 2 });

    const input = {
      nome: 'Canecas Premium',
      idAscendente: 1,
    };

    const result = await controller.alterarCategoria(2, input);

    expect(alterarCategoriaProdutoUseCase.execute).toHaveBeenCalledWith(
      2,
      input,
    );
    expect(result).toEqual({ id: 2 });
  });

  it('deve buscar produto por id', async () => {
    const detalhe: DetalheProdutoDto = {
      id: 1,
      nome: 'Caneca',
      codigo: 'CAN001',
      idCategoria: 1,
      valor: 2500,
      categoria: { id: 1, nome: 'Canecas' },
      quantidadeEstoque: 10,
    };
    produtoService.obterDetalheProdutoPorId.mockResolvedValue(detalhe);

    const result = await controller.getProdutoById(1);

    expect(produtoService.obterDetalheProdutoPorId).toHaveBeenCalledWith(1);
    expect(result).toBe(detalhe);
  });

  it('deve delegar entrada de estoque', async () => {
    produtoService.entradaEstoque.mockResolvedValue(undefined);

    await controller.entradaEstoque(1, {
      quantidade: 10,
      origem: OrigemMovimentacaoEstoque.COMPRA,
    });

    expect(produtoService.entradaEstoque).toHaveBeenCalledWith(
      1,
      10,
      OrigemMovimentacaoEstoque.COMPRA,
    );
  });

  it('deve delegar saída de estoque', async () => {
    produtoService.saidaEstoque.mockResolvedValue(undefined);

    await controller.saidaEstoque(1, {
      quantidade: 2,
      origem: OrigemMovimentacaoEstoque.PERDA,
    });

    expect(produtoService.saidaEstoque).toHaveBeenCalledWith(
      1,
      2,
      OrigemMovimentacaoEstoque.PERDA,
    );
  });
});
