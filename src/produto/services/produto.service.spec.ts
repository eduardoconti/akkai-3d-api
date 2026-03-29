import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoService } from '@produto/services';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import {
  CategoriaProduto,
  MovimentacaoEstoque,
  Produto,
} from '@produto/entities';

describe('ProdutoService', () => {
  let service: ProdutoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        {
          provide: getRepositoryToken(Produto),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CategoriaProduto),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MovimentacaoEstoque),
          useValue: {},
        },
        {
          provide: getDataSourceToken(),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
