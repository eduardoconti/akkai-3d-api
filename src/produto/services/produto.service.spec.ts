import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoService } from '@produto/services/produto.service';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from '@produto/entities/produto.entity';
import { CategoriaProduto } from '@produto/entities/categoria-produto.entity';
import { MovimentacaoEstoque } from '@produto/entities/movimentacao-estoque.entity';

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
