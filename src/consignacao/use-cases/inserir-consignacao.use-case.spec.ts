import { BadRequestException } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { Consignacao, ItemConsignacao } from '@consignacao/entities';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { ConsignacaoService, RevendedorService } from '@consignacao/services';
import { InserirConsignacaoUseCase } from './inserir-consignacao.use-case';

describe('InserirConsignacaoUseCase', () => {
  let useCase: InserirConsignacaoUseCase;
  let consignacaoService: { salvarConsignacao: jest.Mock };
  let revendedorService: { garantirRevendedorAtivo: jest.Mock };
  let produtoService: { obterDetalheProdutoPorId: jest.Mock };

  beforeEach(() => {
    consignacaoService = { salvarConsignacao: jest.fn() };
    revendedorService = { garantirRevendedorAtivo: jest.fn() };
    produtoService = { obterDetalheProdutoPorId: jest.fn() };

    useCase = new InserirConsignacaoUseCase(
      consignacaoService as unknown as ConsignacaoService,
      revendedorService as unknown as RevendedorService,
      produtoService as unknown as ProdutoService,
      { usuarioId: 9 } as CurrentUserContext,
    );
  });

  it('deve criar consignação e gerar saída de estoque', async () => {
    const resposta = { id: 1, itens: [] };
    revendedorService.garantirRevendedorAtivo.mockResolvedValue({
      percentualDesconto: 15,
    });
    produtoService.obterDetalheProdutoPorId.mockResolvedValue({
      id: 10,
      nome: 'Dragão articulado',
      valor: 2500,
      quantidadeEstoque: 12,
    });
    consignacaoService.salvarConsignacao.mockResolvedValue(resposta);

    const resultado = await useCase.execute({
      idRevendedor: 3,
      itens: [{ idProduto: 10, quantidade: 4 }],
    });

    expect(resultado).toBe(resposta);
    expect(revendedorService.garantirRevendedorAtivo).toHaveBeenCalledWith(3);
    expect(consignacaoService.salvarConsignacao).toHaveBeenCalledTimes(1);

    const [consignacao, itens, movimentacoes] = consignacaoService
      .salvarConsignacao.mock.calls[0] as [
      Consignacao,
      ItemConsignacao[],
      MovimentacaoEstoque[],
    ];

    expect(consignacao).toMatchObject({
      idRevendedor: 3,
      idUsuarioInclusao: 9,
      percentualDesconto: 15,
    });
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({
      idProduto: 10,
      quantidadeEnviada: 4,
      quantidadeVendida: 0,
      quantidadeDevolvida: 0,
      valorUnitario: 2500,
    });
    expect(movimentacoes[0]).toMatchObject({
      idProduto: 10,
      quantidade: 4,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao: 9,
    });
  });

  it('deve manter o valor cheio da peça mesmo quando revendedor tem desconto', async () => {
    const resposta = { id: 1, itens: [] };
    revendedorService.garantirRevendedorAtivo.mockResolvedValue({
      percentualDesconto: 20,
    });
    produtoService.obterDetalheProdutoPorId.mockResolvedValue({
      id: 10,
      nome: 'Dragão articulado',
      valor: 2500,
      quantidadeEstoque: 12,
    });
    consignacaoService.salvarConsignacao.mockResolvedValue(resposta);

    await useCase.execute({
      idRevendedor: 3,
      itens: [{ idProduto: 10, quantidade: 4 }],
    });

    const [, itens] = consignacaoService.salvarConsignacao.mock.calls[0] as [
      Consignacao,
      ItemConsignacao[],
      MovimentacaoEstoque[],
    ];

    expect(itens[0]?.valorUnitario).toBe(2500);
  });

  it('deve impedir produto repetido na mesma consignação', async () => {
    revendedorService.garantirRevendedorAtivo.mockResolvedValue({
      percentualDesconto: 0,
    });

    await expect(
      useCase.execute({
        idRevendedor: 3,
        itens: [
          { idProduto: 10, quantidade: 1 },
          { idProduto: 10, quantidade: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(consignacaoService.salvarConsignacao).not.toHaveBeenCalled();
  });

  it('deve impedir consignação sem estoque suficiente', async () => {
    revendedorService.garantirRevendedorAtivo.mockResolvedValue({
      percentualDesconto: 0,
    });
    produtoService.obterDetalheProdutoPorId.mockResolvedValue({
      id: 10,
      nome: 'Dragão articulado',
      valor: 2500,
      quantidadeEstoque: 1,
    });

    await expect(
      useCase.execute({
        idRevendedor: 3,
        itens: [{ idProduto: 10, quantidade: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(consignacaoService.salvarConsignacao).not.toHaveBeenCalled();
  });
});
