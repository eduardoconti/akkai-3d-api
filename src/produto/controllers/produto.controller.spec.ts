import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from '@produto/controllers';
import {
  CategoriaProduto,
  OrigemMovimentacaoEstoque,
  Produto,
} from '@produto/entities';
import {
  InserirCategoriaProdutoUseCase,
  InserirProdutoUseCase,
} from '@produto/use-cases';
import { ProdutoService } from '@produto/services';
import { DetalheProdutoDto } from '@produto/dto';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let inserirProdutoUseCase: { execute: jest.Mock };
  let inserirCategoriaProdutoUseCase: { execute: jest.Mock };
  let produtoService: {
    listarProdutos: jest.Mock;
    listarCategorias: jest.Mock;
    getProdutoById: jest.Mock;
    entradaEstoque: jest.Mock;
  };

  beforeEach(async () => {
    inserirProdutoUseCase = { execute: jest.fn() };
    inserirCategoriaProdutoUseCase = { execute: jest.fn() };
    produtoService = {
      listarProdutos: jest.fn(),
      listarCategorias: jest.fn(),
      getProdutoById: jest.fn(),
      entradaEstoque: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: InserirProdutoUseCase,
          useValue: inserirProdutoUseCase,
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

  it('deve listar produtos', async () => {
    const produtos = [Object.assign(new Produto(), { id: 1 })];
    produtoService.listarProdutos.mockResolvedValue(produtos);

    const result = await controller.listarProdutos();

    expect(produtoService.listarProdutos).toHaveBeenCalled();
    expect(result).toBe(produtos);
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

  it('deve buscar produto por id', async () => {
    const detalhe: DetalheProdutoDto = {
      id: 1,
      nome: 'Caneca',
      codigo: 'CAN001',
      valor: 2500,
      categoria: { id: 1, nome: 'Canecas' },
      quantidadeEstoque: 10,
    };
    produtoService.getProdutoById.mockResolvedValue(detalhe);

    const result = await controller.getProdutoById(1);

    expect(produtoService.getProdutoById).toHaveBeenCalledWith(1);
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
});
