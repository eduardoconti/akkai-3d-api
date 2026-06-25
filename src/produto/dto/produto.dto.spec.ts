import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  OrigemMovimentacaoEstoque,
  StatusProduto,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { AlterarProdutoDto } from './alterar-produto.dto';
import { AlterarStatusProdutoDto } from './alterar-status-produto.dto';
import { InserirProdutoDto } from './inserir-produto.dto';
import { PesquisarMovimentacoesEstoqueDto } from './pesquisar-movimentacoes-estoque.dto';

const produtoValido = {
  nome: 'Caneca',
  codigo: 1001,
  idCategoria: 1,
  valor: 2500,
};

describe('ProdutoDto', () => {
  it.each([InserirProdutoDto, AlterarProdutoDto])(
    'deve aceitar código numérico em %p',
    async (Dto) => {
      const dto = plainToInstance(Dto, produtoValido);

      const errors = await validate(dto);

      expect(dto.codigo).toBe(1001);
      expect(errors).toHaveLength(0);
    },
  );

  it.each([InserirProdutoDto, AlterarProdutoDto])(
    'deve rejeitar código alfanumérico em %p',
    async (Dto) => {
      const dto = plainToInstance(Dto, {
        ...produtoValido,
        codigo: 'CAN001',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.property).toBe('codigo');
      expect(errors[0]?.constraints?.['isInt']).toBe(
        'O código do produto deve ser um número inteiro.',
      );
    },
  );

  it('deve aceitar status válido para alteração de status', async () => {
    const dto = plainToInstance(AlterarStatusProdutoDto, {
      status: StatusProduto.INATIVO,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar status inválido para alteração de status', async () => {
    const dto = plainToInstance(AlterarStatusProdutoDto, {
      status: 'BLOQUEADO',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('status');
    expect(errors[0]?.constraints?.['isEnum']).toBe(
      'O status do produto deve ser ATIVO ou INATIVO.',
    );
  });

  it('deve normalizar filtros de movimentação de estoque', async () => {
    const dto = plainToInstance(PesquisarMovimentacoesEstoqueDto, {
      tipos: 'E,S',
      origens: 'COMPRA,PRODUCAO',
      idProduto: '10',
      dataInicio: '2026-06-01',
      dataFim: '2026-06-30',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.tipos).toEqual([
      TipoMovimentacaoEstoque.ENTRADA,
      TipoMovimentacaoEstoque.SAIDA,
    ]);
    expect(dto.origens).toEqual([
      OrigemMovimentacaoEstoque.COMPRA,
      OrigemMovimentacaoEstoque.PRODUCAO,
    ]);
    expect(dto.idProduto).toBe(10);
  });

  it('deve aplicar filtros padrão de movimentação de estoque', async () => {
    const dto = plainToInstance(PesquisarMovimentacoesEstoqueDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.tipos).toEqual([
      TipoMovimentacaoEstoque.ENTRADA,
      TipoMovimentacaoEstoque.SAIDA,
    ]);
    expect(dto.origens).toEqual(
      expect.arrayContaining([
        OrigemMovimentacaoEstoque.COMPRA,
        OrigemMovimentacaoEstoque.AJUSTE,
        OrigemMovimentacaoEstoque.PERDA,
        OrigemMovimentacaoEstoque.PRODUCAO,
        OrigemMovimentacaoEstoque.CONSIGNACAO,
        OrigemMovimentacaoEstoque.DEVOLUCAO,
        OrigemMovimentacaoEstoque.TROCA,
      ]),
    );
    expect(dto.origens).not.toContain(OrigemMovimentacaoEstoque.VENDA);
  });
});
