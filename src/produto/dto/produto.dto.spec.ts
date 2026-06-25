import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusProduto } from '@produto/entities';
import { AlterarProdutoDto } from './alterar-produto.dto';
import { AlterarStatusProdutoDto } from './alterar-status-produto.dto';
import { InserirProdutoDto } from './inserir-produto.dto';

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
});
