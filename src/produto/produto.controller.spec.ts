import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from './produto.controller';
import { InserirProdutoUseCase } from './use-cases/inserir-produto.use-case';
import { ProdutoService } from './services/produto.service';

describe('ProdutoController', () => {
  let controller: ProdutoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: InserirProdutoUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ProdutoService,
          useValue: {
            listarProdutos: jest.fn(),
            listarCategorias: jest.fn(),
            getProdutoById: jest.fn(),
            entradaEstoque: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProdutoController>(ProdutoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
