import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  Produto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { EstoqueService, ProdutoService } from '@produto/services';

describe('EstoqueService', () => {
  let service: EstoqueService;
  let movimentacaoRepository: { save: jest.Mock; findAndCount: jest.Mock };
  let garantirExisteProdutoMock: jest.Mock;

  beforeEach(async () => {
    movimentacaoRepository = { save: jest.fn(), findAndCount: jest.fn() };
    garantirExisteProdutoMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstoqueService,
        {
          provide: getRepositoryToken(MovimentacaoEstoque),
          useValue: movimentacaoRepository,
        },
        {
          provide: ProdutoService,
          useValue: { garantirExisteProduto: garantirExisteProdutoMock },
        },
      ],
    }).compile();

    service = module.get<EstoqueService>(EstoqueService);
  });

  it('deve registrar entrada de estoque', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 1 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.entradaEstoque(1, 5, OrigemMovimentacaoEstoque.COMPRA);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 5,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.COMPRA,
      }),
    );
  });

  it('deve registrar entrada de estoque por producao', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 2 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.entradaEstoque(2, 3, OrigemMovimentacaoEstoque.PRODUCAO);

    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: OrigemMovimentacaoEstoque.PRODUCAO,
      }),
    );
  });

  it('deve registrar saída de estoque', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 1 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.saidaEstoque(1, 2, OrigemMovimentacaoEstoque.AJUSTE);

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(1);
    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idProduto: 1,
        quantidade: 2,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.AJUSTE,
      }),
    );
  });

  it('deve registrar saída de estoque por perda', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 3 }),
    );
    movimentacaoRepository.save.mockResolvedValue(undefined);

    await service.saidaEstoque(3, 1, OrigemMovimentacaoEstoque.PERDA);

    expect(movimentacaoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.PERDA,
      }),
    );
  });

  it('deve listar movimentações por produto ordenadas por data decrescente', async () => {
    garantirExisteProdutoMock.mockResolvedValue(
      Object.assign(new Produto(), { id: 3 }),
    );
    movimentacaoRepository.findAndCount.mockResolvedValue([
      [
        Object.assign(new MovimentacaoEstoque(), {
          id: 11,
          idProduto: 3,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
        }),
      ],
      1,
    ]);

    const result = await service.listarMovimentacoesPorProduto(3, {
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(garantirExisteProdutoMock).toHaveBeenCalledWith(3);
    expect(movimentacaoRepository.findAndCount).toHaveBeenCalledWith({
      where: { idProduto: 3 },
      order: { dataInclusao: 'DESC', id: 'DESC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      itens: [
        {
          id: 11,
          idProduto: 3,
          idItemVenda: undefined,
          quantidade: 2,
          tipo: TipoMovimentacaoEstoque.SAIDA,
          origem: OrigemMovimentacaoEstoque.VENDA,
          dataInclusao: new Date('2026-04-10T10:30:00.000Z'),
        },
      ],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });
});
