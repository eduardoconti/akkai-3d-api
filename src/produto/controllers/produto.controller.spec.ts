import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from '@produto/controllers';
import { InserirProdutoUseCase } from '@produto/use-cases';
import { ProdutoService } from '@produto/services';

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
