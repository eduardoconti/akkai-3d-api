import { calcularPermissoesEfetivas } from '@auth/utils/permissoes-efetivas';
import { Role, User, UserPermission } from '@auth/entities';

function criarUsuario(
  doPapel: string[],
  ajustes?: Array<{ nome: string; granted: boolean }>,
): Pick<User, 'role' | 'permissoesPersonalizadas'> {
  return {
    role: {
      rolePermissions: doPapel.map((name) => ({ permission: { name } })),
    } as unknown as Role,
    permissoesPersonalizadas: ajustes?.map(
      ({ nome, granted }) =>
        ({ granted, permission: { name: nome } }) as unknown as UserPermission,
    ),
  };
}

describe('calcularPermissoesEfetivas', () => {
  it('deve retornar as permissões do papel quando não há ajustes', () => {
    const usuario = criarUsuario(['venda.ler', 'venda.inserir']);

    expect(calcularPermissoesEfetivas(usuario).sort()).toEqual([
      'venda.inserir',
      'venda.ler',
    ]);
  });

  it('deve incluir as permissões concedidas individualmente', () => {
    const usuario = criarUsuario(
      ['venda.ler'],
      [{ nome: 'produto.excluir', granted: true }],
    );

    expect(calcularPermissoesEfetivas(usuario).sort()).toEqual([
      'produto.excluir',
      'venda.ler',
    ]);
  });

  it('deve remover as permissões revogadas individualmente', () => {
    const usuario = criarUsuario(
      ['venda.ler', 'venda.excluir'],
      [{ nome: 'venda.excluir', granted: false }],
    );

    expect(calcularPermissoesEfetivas(usuario)).toEqual(['venda.ler']);
  });

  it('não deve duplicar uma permissão concedida que o papel já tem', () => {
    const usuario = criarUsuario(
      ['venda.ler'],
      [{ nome: 'venda.ler', granted: true }],
    );

    expect(calcularPermissoesEfetivas(usuario)).toEqual(['venda.ler']);
  });
});
