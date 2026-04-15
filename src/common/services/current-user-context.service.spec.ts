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
});
