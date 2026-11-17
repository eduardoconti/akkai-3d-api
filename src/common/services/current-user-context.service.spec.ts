import { UnauthorizedException } from '@nestjs/common';
import { CurrentUserContext } from './current-user-context.service';

describe('CurrentUserContext', () => {
  it('deve retornar o id do usuário autenticado', () => {
    const service = new CurrentUserContext({
      user: {
        sub: 7,
        login: 'eduardo',
        role: 'admin',
        permissions: [],
      },
    });

    expect(service.usuarioId).toBe(7);
  });

  it('deve lançar erro quando não houver usuário autenticado', () => {
    const service = new CurrentUserContext({});

    expect(() => service.usuarioId).toThrow(
      new UnauthorizedException('Usuário não autenticado.'),
    );
  });

  it('deve retornar as permissões do usuário autenticado', () => {
    const service = new CurrentUserContext({
      user: { sub: 7, permissions: ['orcamento.ler', 'caixa.ler'] },
    });

    expect(service.permissoes).toEqual(['orcamento.ler', 'caixa.ler']);
  });

  it('deve retornar lista vazia sem usuário ou sem permissões válidas', () => {
    expect(new CurrentUserContext({}).permissoes).toEqual([]);
    expect(
      new CurrentUserContext({ user: { sub: 1, permissions: 'x' } }).permissoes,
    ).toEqual([]);
  });
});
